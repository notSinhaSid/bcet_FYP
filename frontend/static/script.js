// Function to load different pages dynamically
function loadPage(page) {
    let content = document.getElementById("content");

    if (page === "home") {
        content.innerHTML = `
            <h1>Welcome to the Student Feedback System</h1>
            <p>Select an option from the navigation menu.</p>
        `;
    } 
    else if (page === "login") {
        content.innerHTML = `
            <h2>Login</h2>
            <form id="login-form">
                <input type="text" id="login-username" placeholder="Username" required>
                <input type="password" id="login-password" placeholder="Password" required>
                <button type="submit">Login</button>
            </form>
            <p>Don't have an account? <a href="#" onclick="loadPage('signup')">Sign up</a></p>
        `;

        document.getElementById("login-form").addEventListener("submit", loginUser);
    } 
    else if (page === "feedback") {
        if (!localStorage.getItem("token")) {
            content.innerHTML = `<h2>You must <a href="#" onclick="loadPage('login')">Login</a> to give feedback.</h2>`;
            return;
        }
        content.innerHTML = `
            <h2>Give Feedback</h2>
            <label for="college">Select College:</label>
            <select id="college">
                <option value="college1">College 1</option>
                <option value="college2">College 2</option>
            </select>
            <div id="questions"></div>
        `;

        loadFeedbackQuestions();
    } 
    // else if (page === "feedback") {
    //     if (!localStorage.getItem("token")) {
    //         content.innerHTML = `<h2>You must <a href="#" onclick="loadPage('login')">Login</a> to give feedback.</h2>`;
    //         return;
    //     }
    //     let username = localStorage.getItem("username");
    //     content.innerHTML = `
    //     <h2>Give Feedback</h2>
    //     <p id="submission-status"></p>
    //     <div id="feedback-form">
    //         <label for="feedback-college">Select College:</label>
    //         <select id="feedback-college">
    //             <option value="college1">College_1</option>
    //             <option value="college2">College_2</option>
    //         </select>
    //         <textarea id="feedback-text" placeholder="Enter your feedback..."></textarea>
    //         <button id="submit-feedback">Submit Feedback</button>
    //     </div>
    //     `;

    // // Fetch submission status
    // fetch(`http://127.0.0.1:5000/check_submission/${username}`)
    //     .then(response => response.json())
    //     .then(data => {
    //         if (data.submitted) {
    //             document.getElementById("submission-status").innerHTML = `
    //                 <b>You have already submitted feedback for ${data.college}. You cannot submit again.</b>
    //             `;
    //             document.getElementById("feedback-form").style.display = "none"; // Hide form
    //         } else {
    //             document.getElementById("submit-feedback").addEventListener("click", submitFeedback);
    //         }
    //     })
    //     .catch(error => console.error("Error checking submission:", error));
    // }
    else if (page === "feedback") {
        if (!localStorage.getItem("token")) {
            content.innerHTML = `<h2>You must <a href="#" onclick="loadPage('login')">Login</a> to give feedback.</h2>`;
            return;
        }
        content.innerHTML = `
            <h2>Give Feedback</h2>
            <label for="college">Select College:</label>
            <select id="college">
                <option value="college1">College 1</option>
                <option value="college2">College 2</option>
            </select>
            <div id="questions"></div>
        `;

        loadFeedbackQuestions();
    } 
    else if (page === "analysis") {
        content.innerHTML = `
            <h2>Analyze Feedback</h2>
            <label for="college">Select College:</label>
            <select id="college">
                <option value="College_1">College 1</option>
                <option value="College_2">College 2</option>
            </select>
            <button onclick="fetchAnalysis()">View Analysis</button>
            <div id="loading" style="display: none;">Processing...</div>
            <div id="analysis-result"></div>
            <div id="charts"></div>
        `;
        // document.getElementById("college").addEventListener("change", fetchAnalysis);
        // fetchAnalysis()
    }
}

// Function to handle user signup
async function signupUser(event) {
    event.preventDefault();

    const name = document.getElementById("signup-name").value;
    const email = document.getElementById("signup-email").value;
    const password = document.getElementById("signup-password").value;

    const response = await fetch("http://127.0.0.1:5000/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
    });

    const data = await response.json();
    alert(data.message);

    if (response.ok) {
        loadPage('login');  // Redirect to login
    }
}

// Function to handle user login
async function loginUser(event) {
    event.preventDefault();

    const username = document.getElementById("login-username").value;
    const password = document.getElementById("login-password").value;

    const response = await fetch("http://127.0.0.1:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    });

    const data = await response.json();
    alert(data.message);

    if (response.ok) {
        localStorage.setItem("token", data.token); // Store JWT Token
        loadPage('home');  // Redirect after login
    }
}

// Function to load feedback questions dynamically
function loadFeedbackQuestions() {
    let questionsContainer = document.getElementById("questions");
    questionsContainer.innerHTML = ""; // Clear previous questions

    let questions = [
        "How would you rate the quality of teaching provided by the faculty members?",
        "Are the faculty members approachable and supportive regarding academic queries?",
        "How effectively do the faculty members use practical examples and real-life applications in their teaching?",
        "How satisfied are you with the cleanliness and maintenance of the college premises?",
        "Are the classrooms adequately equipped with modern amenities (projectors, smart boards, etc.)?",
        "How would you rate the availability and quality of Wi-Fi and internet facilities on campus?",
        "Are the lab facilities and equipment sufficient for conducting practical experiments?",
        "How frequently are the lab equipment and tools updated or maintained?",
        "Do you have access to the necessary software, tools, and resources for your coursework in the labs?",
        "How likely are you to recommend this college to a prospective student?"
    ];

    questions.forEach((question, index) => {
        let questionDiv = document.createElement("div");
        questionDiv.innerHTML = `
            <p>${index + 1}. ${question}</p>
            <textarea id="response${index + 1}"></textarea>
        `;
        questionsContainer.appendChild(questionDiv);
    });

    let submitBtn = document.createElement("button");
    submitBtn.innerText = "Submit Feedback";
    submitBtn.onclick = submitFeedback;
    questionsContainer.appendChild(submitBtn);
}

// Function to submit feedback
async function submitFeedback() {
    const username = localStorage.getItem("username");  // Assuming user is stored in localStorage
    const college = document.getElementById("feedback-college").value;
    const feedback = document.getElementById("feedback-text").value;

    if (!college || !feedback) {
        alert("Please enter your feedback and select a college.");
        return;
    }

    const response = await fetch("http://127.0.0.1:5000/submit_feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, college, feedback }),
    });

    const data = await response.json();

    if (response.ok) {
        alert("Feedback submitted successfully!");
        document.getElementById("feedback-text").value = "";  // Clear input after submission
    } else {
        alert(data.error || "Error submitting feedback");
    }
}


// Function to fetch analysis from the backend
async function fetchAnalysis() {
    const college = document.getElementById("college").value;
    const resultDiv = document.getElementById("analysis-result");
    const loadingDiv = document.getElementById("loading");
    const chartsDiv = document.getElementById("charts");

    resultDiv.innerHTML = "";
    chartsDiv.innerHTML = "";
    loadingDiv.style.display = "block";

    try {
        const response = await fetch(`http://127.0.0.1:5000/analyze_feedback/${college}`);
        const data = await response.json();
        loadingDiv.style.display = "none";

        if (response.status !== 200) {
            resultDiv.innerHTML = `<p style="color:red;">Error: ${data.message || data.error}</p>`;
            return;
        }

        // Extract sentiment counts
        const { sentiment_counts, summary } = data;
        const positive = sentiment_counts.Positive || 0;
        const neutral = sentiment_counts.Neutral || 0;
        const negative = sentiment_counts.Negative || 0;

        // Display summary
        resultDiv.innerHTML = `
            <h3>Sentiment Summary</h3>
            <p><strong>Positive:</strong> ${positive}</p>
            <p><strong>Neutral:</strong> ${neutral}</p>
            <p><strong>Negative:</strong> ${negative}</p>
            <h3>Overall Analysis:</h3>
            <p>${summary}</p>
        `;

        // Generate Charts
        generateCharts(positive, neutral, negative);

    } catch (error) {
        loadingDiv.style.display = "none";
        resultDiv.innerHTML = `<p style="color:red;">Error fetching analysis: ${error}</p>`;
    }
}

// Function to generate bar and pie charts using Plotly
function generateCharts(positive, neutral, negative) {
    const chartsDiv = document.getElementById("charts");

    const labels = ["Positive", "Neutral", "Negative"];
    const values = [positive, neutral, negative];

    // Bar Chart
    const barTrace = {
        x: labels,
        y: values,
        type: "bar",
        marker: { color: ["#28a745", "#ffc107", "#dc3545"] }
    };
    Plotly.newPlot("charts", [barTrace], { title: "Feedback Sentiment Distribution" });

    // Pie Chart
    const pieDiv = document.createElement("div");
    chartsDiv.appendChild(pieDiv);
    const pieTrace = {
        labels: labels,
        values: values,
        type: "pie",
        marker: { colors: ["#28a745", "#ffc107", "#dc3545"] }
    };
    Plotly.newPlot(pieDiv, [pieTrace], { title: "Sentiment Breakdown" });
}

// Load the correct page on startup
document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const page = urlParams.get("page") || "home";
    loadPage(page);
});
