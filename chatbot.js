/* ========================================
   FASTSYNC CHATBOT JAVASCRIPT
   Save as chatbot.js in your project
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
    if (message.includes('react') || message.includes('python') || message.includes('java') || message.includes('ui') || message.includes('design')) {
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
    if (message.includes('skill') || message.includes('learn')) {
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
    if (message.includes('profile') || message.includes('improve')) {
        return `Let me help you improve your profile! ⭐<br><br>
            <strong>Profile Tips:</strong><br>
            • Add a clear profile picture<br>
            • List all your skills<br>
            • Write a detailed bio<br>
            • Upload past projects<br>
            • Keep your availability updated<br><br>
            Complete profiles get 3x more partnership requests!`;
    }

    // How to use
    if (message.includes('how') && (message.includes('use') || message.includes('work') || message.includes('start'))) {
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

    // Greetings
    if (message.includes('hi') || message.includes('hello') || message.includes('hey')) {
        return `Hello! 👋 How can I help you today?<br><br>
            I can assist with:<br>
            • Finding partners<br>
            • Project ideas<br>
            • Skills to learn<br>
            • Using FastSync features<br><br>
            What would you like to know?`;
    }

    // Thank you
    if (message.includes('thank') || message.includes('thanks')) {
        return `You're welcome! 😊 Happy to help!<br><br>
            Need anything else? I'm always here!`;
    }

    // Default response
    return `I'm here to help! 🤖<br><br>
        You can ask me about:<br>
        • "Find me a React developer"<br>
        • "Give me project ideas"<br>
        • "How do I improve my profile?"<br>
        • "What skills should I learn?"<br>
        • "How does FastSync work?"<br><br>
        Try one of these or ask anything else!`;
}

// Show welcome badge after 3 seconds
setTimeout(() => {
    const badge = document.getElementById('chatBadge');
    if (badge) {
        badge.style.display = 'flex';
    }
}, 3000);
