/* ========================================
   FASTSYNC CHATBOT JAVASCRIPT
   Save as: chatbot.js in your project
   NOW WITH SMART AI RESPONSES FOR ANY TOPIC!
   ======================================== */

let isTyping = false;

function toggleChat() {
    const chatWindow = document.getElementById('chatWindow');
    const chatBadge = document.getElementById('chatBadge');
    chatWindow.classList.toggle('active');
    chatBadge.style.display = 'none';
    
    if (chatWindow.classList.contains('active')) {
        document.getElementById('chatInput').focus();
    }
}

function handleKeyPress(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

function sendQuickMessage(message) {
    sendMessage(message);
}

function sendMessage(quickMsg) {
    const input = document.getElementById('chatInput');
    const message = quickMsg || input.value.trim();
    
    if (!message) return;

    // Add user message
    addMessage('user', message);
    input.value = '';

    // Show typing indicator
    showTyping();

    // Get bot response
    setTimeout(() => {
        const response = getBotResponse(message.toLowerCase());
        hideTyping();
        addMessage('bot', response);
    }, 1000 + Math.random() * 1000);
}

function addMessage(sender, text) {
    const messagesContainer = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.textContent = sender === 'bot' ? '🤖' : '👤';
    
    const content = document.createElement('div');
    content.className = 'message-content';
    content.innerHTML = text;
    
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(content);
    messagesContainer.appendChild(messageDiv);
    
    scrollToBottom();
}

function showTyping() {
    if (isTyping) return;
    isTyping = true;
    
    const messagesContainer = document.getElementById('chatMessages');
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message bot';
    typingDiv.id = 'typingIndicator';
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.textContent = '🤖';
    
    const indicator = document.createElement('div');
    indicator.className = 'typing-indicator';
    indicator.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';
    
    typingDiv.appendChild(avatar);
    typingDiv.appendChild(indicator);
    messagesContainer.appendChild(typingDiv);
    
    scrollToBottom();
}

function hideTyping() {
    const typingIndicator = document.getElementById('typingIndicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
    isTyping = false;
}

function scrollToBottom() {
    const messagesContainer = document.getElementById('chatMessages');
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function getBotResponse(message) {
    // ========================================
    // FASTSYNC RELATED RESPONSES
    // ========================================
    
    // Find partners
    if (message.includes('find') && (message.includes('partner') || message.includes('developer') || message.includes('designer'))) {
        return `I can help you find the perfect partner! 🎯<br><br>
            What skills are you looking for?<br>
            • Web Development (React, Node.js)<br>
            • Mobile Development (Flutter, React Native)<br>
            • UI/UX Design<br>
            • AI/ML<br>
            • Other<br><br>
            Or visit <a href="find-partner.html" style="color: #667eea;">Find Partner Page</a> to browse all!`;
    }

    // React/specific skill
    if ((message.includes('react') || message.includes('python') || message.includes('java') || message.includes('ui') || message.includes('design')) && (message.includes('partner') || message.includes('find') || message.includes('need'))) {
        return `Great! I can help you find partners with those skills. 💻<br><br>
            <strong>Recommended Partners:</strong><br>
            • Check <a href="find-partner.html" style="color: #667eea;">Semester Projects</a><br>
            • Browse <a href="personal-projects.html" style="color: #667eea;">Personal Projects</a><br><br>
            You can filter by skills and see their ratings!`;
    }

    // Project ideas
    if (message.includes('project') && (message.includes('idea') || message.includes('suggest') || message.includes('what'))) {
        return `Here are some great project ideas! 💡<br><br>
            <strong>Beginner:</strong><br>
            • Todo List App<br>
            • Weather Dashboard<br>
            • Portfolio Website<br><br>
            <strong>Intermediate:</strong><br>
            • E-commerce Platform<br>
            • Social Media Clone<br>
            • Chat Application<br><br>
            <strong>Advanced:</strong><br>
            • AI Chatbot<br>
            • Video Streaming Platform<br>
            • Blockchain DApp<br><br>
            Need a partner? I can help! 🤝`;
    }

    // Skills to learn
    if (message.includes('skill') && message.includes('learn')) {
        return `Here are the most in-demand skills! 📚<br><br>
            <strong>Frontend:</strong><br>
            • React.js, Vue.js<br>
            • TypeScript<br>
            • Tailwind CSS<br><br>
            <strong>Backend:</strong><br>
            • Node.js, Python<br>
            • MongoDB, PostgreSQL<br>
            • REST APIs<br><br>
            <strong>Other:</strong><br>
            • Git & GitHub<br>
            • Docker<br>
            • AWS/Cloud<br><br>
            Want to find partners to learn together? Let me know!`;
    }

    // Profile help
    if (message.includes('profile') && (message.includes('improve') || message.includes('help'))) {
        return `Let me help you improve your profile! ⭐<br><br>
            <strong>Profile Tips:</strong><br>
            • Add a clear profile picture<br>
            • List all your skills<br>
            • Write a detailed bio<br>
            • Upload past projects<br>
            • Keep your availability updated<br><br>
            Complete profiles get 3x more partnership requests!`;
    }

    // How to use FastSync
    if (message.includes('how') && (message.includes('use') || message.includes('fastsync') || message.includes('work') || message.includes('start'))) {
        return `Welcome to FastSync! Here's how it works: 🚀<br><br>
            1. <strong>Create Profile:</strong> Add your skills & interests<br>
            2. <strong>Find Partners:</strong> Browse by skills/projects<br>
            3. <strong>Connect:</strong> Send requests & start collaborating<br>
            4. <strong>Complete Projects:</strong> Work together<br>
            5. <strong>Leave Reviews:</strong> Rate your experience<br><br>
            Need help with any step? Just ask!`;
    }

    // Reviews
    if (message.includes('review') || message.includes('rating')) {
        return `Reviews build trust on FastSync! ⭐<br><br>
            <strong>How Reviews Work:</strong><br>
            • Complete a partnership<br>
            • Go to <a href="reviews.html" style="color: #667eea;">Reviews Page</a><br>
            • Rate: Communication, Skills, Reliability<br>
            • Write detailed feedback<br><br>
            Higher ratings = More partnership requests!`;
    }

    // Messages/Contact
    if (message.includes('message') || message.includes('contact') || message.includes('chat')) {
        return `To contact partners: 📧<br><br>
            1. Find a partner you like<br>
            2. Click "Contact" button<br>
            3. Send them a message<br><br>
            Pro tip: Mention specific skills or projects to get faster responses!`;
    }

    // Personal projects
    if (message.includes('personal') || message.includes('startup') || message.includes('side project')) {
        return `Looking for personal project partners? 🚀<br><br>
            Visit our <a href="personal-projects.html" style="color: #667eea;">Personal Projects</a> section!<br><br>
            Find partners for:<br>
            • Startups<br>
            • Open Source<br>
            • Freelance work<br>
            • Creative projects<br><br>
            Create your own profile there!`;
    }

    // ========================================
    // ACADEMIC / UNIVERSITY HELP
    // ========================================
    
    // GPA / Grades
    if (message.includes('gpa') || message.includes('grade') || (message.includes('improve') && message.includes('semester'))) {
        return `Great question! Here are proven tips to improve your GPA: 📚<br><br>
            <strong>Study Tips:</strong><br>
            • Attend all classes regularly<br>
            • Study 2-3 hours daily, not just before exams<br>
            • Make summary notes after each lecture<br>
            • Form study groups with serious students<br>
            • Solve past papers before exams<br><br>
            <strong>Time Management:</strong><br>
            • Use a planner/calendar<br>
            • Complete assignments early<br>
            • Review lecture notes same day<br><br>
            <strong>Pro Tip:</strong> Focus on understanding concepts, not just memorizing!<br><br>
            Need a study partner? I can help you find one! 🤝`;
    }

    // Study tips
    if (message.includes('study') || message.includes('exam') || message.includes('test')) {
        return `Here are effective study strategies: 📖<br><br>
            <strong>Before Exams:</strong><br>
            • Start studying 2 weeks early<br>
            • Create a study schedule<br>
            • Practice past papers<br>
            • Sleep well (7-8 hours)<br><br>
            <strong>During Study:</strong><br>
            • Use Pomodoro (25 min study, 5 min break)<br>
            • Teach concepts to others<br>
            • Make flashcards for key points<br>
            • Test yourself regularly<br><br>
            <strong>Exam Day:</strong><br>
            • Eat a healthy breakfast<br>
            • Arrive early, stay calm<br>
            • Read questions carefully<br><br>
            Want to find a study buddy? Let me know! 👥`;
    }

    // Time management
    if (message.includes('time') && (message.includes('manage') || message.includes('management'))) {
        return `Time management is crucial for success! ⏰<br><br>
            <strong>Daily Tips:</strong><br>
            • Wake up early (6-7 AM)<br>
            • Plan your day the night before<br>
            • Prioritize tasks (urgent vs important)<br>
            • Avoid procrastination - start now!<br><br>
            <strong>Study Schedule:</strong><br>
            • Morning: Tough subjects<br>
            • Afternoon: Group projects/assignments<br>
            • Evening: Review & practice<br><br>
            <strong>Apps to Use:</strong><br>
            • Google Calendar<br>
            • Notion/Todoist<br>
            • Forest (focus app)<br><br>
            Remember: Work smart, not just hard! 💪`;
    }

    // Career advice
    if (message.includes('career') || message.includes('job') || message.includes('internship')) {
        return `Career planning is important! Here's my advice: 💼<br><br>
            <strong>Build Your Skills:</strong><br>
            • Learn in-demand technologies<br>
            • Build real projects (portfolio)<br>
            • Contribute to open source<br>
            • Get internships early<br><br>
            <strong>Networking:</strong><br>
            • Connect on LinkedIn<br>
            • Attend tech meetups/events<br>
            • Join student societies<br>
            • Find mentors in your field<br><br>
            <strong>Interview Prep:</strong><br>
            • Practice on LeetCode/HackerRank<br>
            • Build confidence in communication<br>
            • Create a strong resume<br><br>
            FastSync can help you find project partners to build your portfolio! 🚀`;
    }

    // Programming help
    if (message.includes('coding') || message.includes('programming') || message.includes('code')) {
        return `Let me help with coding! 💻<br><br>
            <strong>Learning Tips:</strong><br>
            • Practice daily (even 30 mins)<br>
            • Build real projects, not just tutorials<br>
            • Read others' code on GitHub<br>
            • Debug systematically<br><br>
            <strong>Best Resources:</strong><br>
            • FreeCodeCamp<br>
            • Codecademy<br>
            • YouTube tutorials<br>
            • Official documentation<br><br>
            <strong>Practice Platforms:</strong><br>
            • LeetCode<br>
            • HackerRank<br>
            • Codewars<br><br>
            Need a coding partner? <a href="find-partner.html" style="color: #667eea;">Find one here!</a> 🤝`;
    }

    // Mental health / stress
    if (message.includes('stress') || message.includes('anxiety') || message.includes('mental') || message.includes('pressure')) {
        return `Your mental health is important! 🧠💚<br><br>
            <strong>Stress Management:</strong><br>
            • Take regular breaks<br>
            • Exercise 3-4 times/week<br>
            • Talk to friends/family<br>
            • Get 7-8 hours sleep<br><br>
            <strong>When Feeling Overwhelmed:</strong><br>
            • Break tasks into small steps<br>
            • Focus on one thing at a time<br>
            • Practice deep breathing<br>
            • It's okay to ask for help!<br><br>
            <strong>Remember:</strong><br>
            • You're not alone<br>
            • Bad grades ≠ Bad person<br>
            • Tomorrow is a new day<br><br>
            If you need serious help, please talk to a counselor or trusted adult. 💙`;
    }

    // Motivation
    if (message.includes('motivat') || message.includes('inspire') || message.includes('give up') || message.includes('difficult')) {
        return `Don't give up! You've got this! 💪<br><br>
            <strong>Remember:</strong><br>
            • Every expert was once a beginner<br>
            • Mistakes are part of learning<br>
            • Progress > Perfection<br>
            • You're capable of amazing things!<br><br>
            <strong>When Things Get Tough:</strong><br>
            • Take a break, clear your mind<br>
            • Ask for help - it's a sign of strength<br>
            • Celebrate small wins<br>
            • Keep going, you're closer than you think!<br><br>
            <em>"Success is not final, failure is not fatal: it is the courage to continue that counts."</em> - Winston Churchill<br><br>
            You're doing great! Keep pushing forward! 🌟`;
    }

    // University / Campus life
    if (message.includes('university') || message.includes('campus') || message.includes('college')) {
        return `Making the most of university life! 🎓<br><br>
            <strong>Academic Success:</strong><br>
            • Attend lectures regularly<br>
            • Join study groups<br>
            • Use professor office hours<br>
            • Start assignments early<br><br>
            <strong>Social Life:</strong><br>
            • Join clubs/societies<br>
            • Attend university events<br>
            • Make diverse friends<br>
            • Balance fun & studies<br><br>
            <strong>Career Building:</strong><br>
            • Get internships<br>
            • Build your network<br>
            • Work on side projects<br>
            • Develop soft skills<br><br>
            FastSync helps you find project partners to collaborate with! 🤝`;
    }

    // ========================================
    // GENERAL CONVERSATION
    // ========================================
    
    // Greetings
    if (message.includes('hi') || message.includes('hello') || message.includes('hey') || message === 'hii') {
        return `Hello! 👋 How can I help you today?<br><br>
            I can assist with:<br>
            • Finding project partners<br>
            • Study tips & academic advice<br>
            • Career guidance<br>
            • Tech skills & learning<br>
            • General university questions<br><br>
            What would you like to know?`;
    }

    // How are you
    if (message.includes('how are you') || message.includes('how r u')) {
        return `I'm doing great, thank you for asking! 😊<br><br>
            I'm here and ready to help you with anything you need!<br><br>
            How about you? How can I assist you today?`;
    }

    // Thank you
    if (message.includes('thank') || message.includes('thanks')) {
        return `You're very welcome! 😊<br><br>
            Happy to help! If you need anything else, just ask!<br><br>
            Good luck with your studies and projects! 🌟`;
    }

    // Who are you
    if (message.includes('who are you') || message.includes('what are you')) {
        return `I'm FastSync Assistant! 🤖<br><br>
            I'm your friendly AI helper designed to assist students with:<br>
            • Finding project partners<br>
            • Academic advice & study tips<br>
            • Tech skills & career guidance<br>
            • University life questions<br>
            • And much more!<br><br>
            Think of me as your 24/7 university companion! 😊`;
    }

    // ========================================
    // DEFAULT SMART RESPONSE
    // ========================================
    
    // If question contains "how to"
    if (message.includes('how to') || message.includes('how can')) {
        return `That's a great question! 🤔<br><br>
            I'd love to help you with that! Could you be a bit more specific?<br><br>
            Are you asking about:<br>
            • Academic/study related help?<br>
            • Finding project partners?<br>
            • Learning a specific skill?<br>
            • Something else?<br><br>
            Tell me more and I'll give you the best advice! 💡`;
    }

    // If question contains "what is"
    if (message.includes('what is') || message.includes('what are')) {
        return `Good question! Let me help you understand. 🧠<br><br>
            I can explain concepts related to:<br>
            • Programming & technology<br>
            • University processes<br>
            • FastSync features<br>
            • Study techniques<br><br>
            Could you rephrase your question or give me more context? I want to give you the most accurate answer! 😊`;
    }

    // Generic helpful response for anything else
    return `I'm here to help! 🤖<br><br>
        I didn't quite understand that, but I can assist you with:<br><br>
        <strong>FastSync Features:</strong><br>
        • "Find me a React developer"<br>
        • "How do reviews work?"<br><br>
        <strong>Academic Help:</strong><br>
        • "How to improve my GPA?"<br>
        • "Study tips for exams"<br>
        • "Time management advice"<br><br>
        <strong>Career & Skills:</strong><br>
        • "What skills should I learn?"<br>
        • "Career advice"<br>
        • "Coding help"<br><br>
        Try asking me anything! I'm always learning! 💙`;
}

// Show welcome badge after 3 seconds
setTimeout(() => {
    const badge = document.getElementById('chatBadge');
    if (badge) {
        badge.style.display = 'flex';
    }
}, 3000);
