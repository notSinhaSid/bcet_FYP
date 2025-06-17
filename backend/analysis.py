from flask import Blueprint, jsonify
from textblob import TextBlob
import ollama
from config import FEEDBACK_DB_PATH
from models import get_db_connection

analysis = Blueprint('analysis', __name__)

# Function to analyze multiple feedbacks in one Ollama call
def batch_analyze_sentiments(feedback_list):
    
    # Create the prompt for the model
    prompt = "Classify the sentiment (Positive, Negative, Neutral) for each feedback:\n\n"
    for i, feedback in enumerate(feedback_list):
        prompt += f"{i+1}. {feedback}\n"

    # Call the Ollama model with the prompt
    # Using the deepseek-r1:7b model for sentiment analysis
    response = ollama.chat(model="deepseek-r1:7b", messages=[{"role": "user", "content": prompt}])
    sentiment_results = response["message"]["content"].strip().split("\n")

    sentiments = []
    for result in sentiment_results:
        if "Positive" in result:
            sentiments.append("Positive")
        elif "Negative" in result:
            sentiments.append("Negative")
        else:
            sentiments.append("Neutral")

    return sentiments

# Route to analyze feedback for a specific college
@analysis.route('/analyze_feedback/<college_name>', methods=['GET'])
def analyze_feedback(college_name):
    try:
        conn = get_db_connection(FEEDBACK_DB_PATH)
        cursor = conn.cursor()
        
        # Fetch all feedback responses
        cursor.execute(f'SELECT * FROM "{college_name}"')
        rows = cursor.fetchall()
        conn.close()

        if not rows:
            return jsonify({"message": "No feedback available"}), 404

        # Column headers (excluding username)
        column_names = [desc[0] for desc in cursor.description][1:]

        analysis_results = []
        pos=0
        neg=0
        neu=0
        
        for row in rows:
            feedbacks = row[1:]            # row_analysis = {"username": username, "sentiments": {}}
            row_analysis=[]

            for i, feedback in enumerate(feedbacks):
                if feedback.strip():  # Avoid empty responses
                    sentiment_score = TextBlob(feedback).sentiment.polarity
                    if sentiment_score > 0:
                        sentiment = "Positive"
                        pos+=1
                    elif sentiment_score < 0:
                        sentiment = "Negative"
                        neg+=1
                    else:
                        sentiment = "Neutral"
                        neu+=1
                else:
                    sentiment = "Neutral"
                    neu+=1

                # row_analysis["sentiments"][column_names[i]] = sentiment
                row_analysis.append(sentiment)

            analysis_results.append(row_analysis)
            # print(analysis_results)

        # return jsonify({"analysis": analysis_results}), 200
        sentiment_counts = {"Positive": 0, "Neutral": 0, "Negative": 0}
        sentiment_counts['Positive']=pos
        sentiment_counts['Negative']=neg
        sentiment_counts['Neutral']=neu
        summary_prompt = (
            f"Based on the following sentiment results {sentiment_counts}, "
            f"provide a debriefing from the student's perspective regarding the overall sentiment. "
            f"Describe how students might feel about their experience, highlighting both positives and areas of concern."
            f"Make sure to mark your final answer as 'Answer:' so I can extract it for processing."
        )
        summary_response = ollama.chat(model="deepseek-r1:7b", messages=[{"role": "user", "content": summary_prompt}])
        content = summary_response["message"]["content"]
        # summary=content
        st=content.find("Answer:")
        # end=content.find("")
        summary=content[st+7:len(content)]


        return jsonify({"sentiment_counts": sentiment_counts, "summary": summary}), 200

    except Exception as e:
        print(e)
        return jsonify({"error": str(e)}), 500
    # try:
    #     conn = get_db_connection(FEEDBACK_DB_PATH)
    #     cursor = conn.cursor()
        
    #     # Fetch all feedback responses
    #     cursor.execute(f'SELECT * FROM "{college_name}"')
    #     rows = cursor.fetchall()
    #     conn.close()

    #     if not rows:
    #         return jsonify({"message": "No feedback available"}), 404

    #     sentiment_counts = {"Positive": 0, "Neutral": 0, "Negative": 0}
    #     all_feedback = []
        
    #     # Collect all feedback responses
    #     for row in rows:
    #         responses = row[1:]  # Skip the username column
    #         all_feedback.extend([response for response in responses if response])  # Filter out empty responses
    #     print(all_feedback[0:10])

    #     # Analyze in batch
    #     sentiments = batch_analyze_sentiments(all_feedback)
    #     print(len(sentiments))

    #     # Count sentiment occurrences
    #     for sentiment in sentiments:
    #         sentiment_counts[sentiment] += 1

    #     # Generate summary
    #     summary_prompt = (
    #         f"Based on the following sentiment results {sentiment_counts}, "
    #         f"give an overall trend of student feedback."
    #         f"Note: Encode your final answer within <answer> and </answer> tags."
    #     )
    #     summary_response = ollama.chat(model="deepseek-r1:7b", messages=[{"role": "user", "content": summary_prompt}])
    #     content = summary_response["message"]["content"]
    #     summary=content
    #     # st=content.find("<answer>")
    #     # end=content.find("<answer>")
    #     # summary=content[st+8:end+1]


    #     return jsonify({"sentiment_counts": sentiment_counts, "summary": summary}), 200

    # except Exception as e:
    #     return jsonify({"error": str(e)}), 500
