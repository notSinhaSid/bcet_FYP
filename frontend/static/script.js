// Function to load different pages dynamically
function loadPage(page) {
    const content = document.getElementById("content");
    const navbar = document.getElementById("navbar");
    const token = localStorage.getItem("token");



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
                <input type="email" id="login-email" placeholder="Email" required>
                <input type="password" id="login-password" placeholder="Password" required>
                <button type="submit">Login</button>
            </form>
            <p>Don't have an account? <a href="#" onclick="loadPage('signup')">Sign up</a></p>
        `;

        document.getElementById("login-form").addEventListener("submit", loginUser);
    }
    else if (page === "signup") {
        content.innerHTML = `
            <h2>Signup</h2>
            <form id="signup-form">
                <input type="text" id="signup-name" placeholder="Full Name" required>
                <input type="email" id="signup-email" placeholder="Email" required>
                <input type="password" id="signup-password" placeholder="Password" required>
                <button type="submit">Signup</button>
            </form>
            <p>Already have an account? <a href="#" onclick="loadPage('login')">Login</a></p>
        `;

        document.getElementById("signup-form").addEventListener("submit", signupUser);
    } 
    else if (page === "feedback") {
        if (!token) {
            // content.innerHTML = `<h2>You must <a href="#" onclick="loadPage('login')">Login</a> to give feedback.</h2>`;
            alert("You must be logged in to give feedback.");
            loadPage("login"); // Redirect to login page
            return;
        }
        content.innerHTML = `
            <h2>Give Feedback</h2>
            <label for="college">Select College:</label>
            <select id="college">
                <option value="College_1">College 1</option>
                <option value="College_2">College 2</option>
            </select>
            <button id="nextButton" onclick="loadFeedbackQuestions()">Select</button>
            <div id="feedback-form"></div>
        `;
        const collegeDropdown = document.getElementById("college");
        const nextButton = document.getElementById("nextButton");
        const feedbackForm = document.getElementById("feedback-form");

        // Hide Next button when clicked
        nextButton.addEventListener("click", function () {
            nextButton.style.display = "none";
        });

    // Reset feedback questions and show Next button when college changes
        collegeDropdown.addEventListener("change", function () {
            nextButton.style.display = "block";
            feedbackForm.innerHTML = "";  // Clear any previous questions
        });
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
    }
}

function logoutUser() {
    localStorage.removeItem("token");
    localStorage.removeItem("tokenExpiry");
    localStorage.removeItem("email");
    alert("Logged out successfully!");
    updateNavbar();  // Refresh navbar after logout
    loadPage("login"); // Redirect to login
}

async function signupUser(event) {
    event.preventDefault();
    const name = document.getElementById("signup-name").value;
    const email = document.getElementById("signup-email").value;
    const password = document.getElementById("signup-password").value;
    
    fetch("http://127.0.0.1:5000/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.Success) {
            alert("Signup successful! You are now logged in.");
            localStorage.setItem("token", data.token); // Store token like in login
            const expiryTime = Date.now() + 1 * 60 * 60 * 1000;
            localStorage.setItem("tokenExpiry", expiryTime);
            localStorage.setItem("email",email)
            updateNavbar();
            loadPage("home"); // Redirect to home page
        } else {
            alert("Signup failed: " + data.message);
        }
    })
    .catch(error => console.error("Signup error:", error));
}

// Function to handle user login
async function loginUser(event) {
    event.preventDefault();

    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    const response = await fetch("http://127.0.0.1:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    alert(data.message);

    if (response.ok) {
        localStorage.setItem("token", data.token); // Store JWT Token
        localStorage.setItem("email", email);
        const expiryTime = Date.now() + 1 * 60 * 60 * 1000;
        localStorage.setItem("tokenExpiry", expiryTime);
        updateNavbar();
        loadPage('home');  // Redirect after login
    }
}

// Function to load feedback questions dynamically
function loadFeedbackQuestions() {
    let questionsContainer = document.getElementById("feedback-form");
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
    const email = localStorage.getItem("email");  // Assuming user is stored in localStorage
    const college = document.getElementById("college").value;
    // const feedback = document.getElementById("feedback-form").values;
    const feedbackTextareas = document.querySelectorAll("#feedback-form textarea");
    const feedback = [];
    
    let allAnswered=true;

    feedbackTextareas.forEach((textarea, index) => {
        const question = textarea.previousElementSibling.innerText;
        const answer = textarea.value.trim();

        if(!answer){
            allAnswered = false;
            textarea.style.border = "2px solid red";
        } else {
            textarea.style.border = "";
        }

        feedback.push({ question: question, answer: answer});
    });


    if (!college || !allAnswered) {
        alert("Please enter your feedback and select a college.");
        return;
    }

    const response = await fetch("http://127.0.0.1:5000/submit_feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, college, feedback }),
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

function updateNavbar() {
    const navbar = document.getElementById("navbar");
    const token = localStorage.getItem("token");

    if (navbar) {
        let navContent = `
            <ul>
                <li><a href="index.html" onclick="loadPage('home')">Home</a></li>
        `;

        if (token) {
            // If logged in, show "Give Feedback", "Analyze Feedback", and "Logout"
            navContent += `
                <li><a href="index.html?page=feedback" id="feedback-link" onclick="loadPage('feedback')">Give Feedback</a></li>
                <li><a href="index.html?page=analysis" onclick="loadPage('analysis')">Analyze Feedback</a></li>
                <li><a href="#" id="logoutButton" onclick="logoutUser()">Logout</a></li>
            `;
        } else {
            // If not logged in, show Login and Signup
            navContent += `
                <li><a href="index.html?page=login" onclick="loadPage('login')">Login</a></li>
                <li><a href="index.html?page=signup" onclick="loadPage('signup')">Signup</a></li>
            `;
        }

        navContent += `</ul>`;
        navbar.innerHTML = navContent;
    }
}

function updateUIAfterLogin() {
    const token = localStorage.getItem("authToken");
    const navbar = document.getElementById("navbar");

    if (token) {
        // Hide login and signup links
        document.querySelector("a[href*='login']").style.display = "none";
        document.querySelector("a[href*='signup']").style.display = "none";

        // Show logout button if not already added
        if (!document.getElementById("logoutButton")) {
            const logoutLink = document.createElement("li");
            logoutLink.innerHTML = `<a href="#" id="logoutButton" style="color:white">Logout</a>`;
            logoutLink.addEventListener("click", logoutUser);
            navbar.appendChild(logoutLink);
        }
    }
}

// Load the correct page on startup
document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const page = urlParams.get("page") || "home";
    updateNavbar();
    loadPage(page);
});

function checkTokenValidity() {
    const token = localStorage.getItem("token");
    const expiryTime = localStorage.getItem("tokenExpiry");

    if (!token || !expiryTime || Date.now() > expiryTime) {
        logoutUser(); // Auto-logout if token expired
    }
}

setInterval(checkTokenValidity, 3600000);