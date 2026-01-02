// Animated network background
const canvas = document.getElementById('contactCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const particles = [];
const particleCount = 60;
const maxDistance = 150;

class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.radius = 2;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#667eea';
        ctx.fill();
    }
}

for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
}

function connectParticles() {
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < maxDistance) {
                ctx.beginPath();
                ctx.strokeStyle = `rgba(102, 126, 234, ${1 - distance / maxDistance})`;
                ctx.lineWidth = 0.5;
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.stroke();
            }
        }
    }
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    particles.forEach(particle => {
        particle.update();
        particle.draw();
    });
    
    connectParticles();
    requestAnimationFrame(animate);
}

animate();

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

// Contact Form Handler
const contactForm = document.getElementById('contactForm');

contactForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const userName = document.getElementById('userName').value.trim();
    const userEmail = document.getElementById('userEmail').value.trim();
    const subject = document.getElementById('subject').value.trim();
    const message = document.getElementById('message').value.trim();
    
    // Validation
    if (!userName || !userEmail || !message) {
        alert('❌ Please fill in all required fields');
        return;
    }
    
    // Email validation
    if (!userEmail.includes('@')) {
        alert('❌ Please enter a valid email address');
        return;
    }
    
    // Show loading state
    const submitBtn = contactForm.querySelector('.btn-submit');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;
    
    // Prepare email content
    const adminEmail = 'ammadu829@gmail.com';
    const emailSubject = subject ? `FASTSync Query: ${subject}` : 'FASTSync Query';
    
    const emailBody = `
New Query from FASTSync Contact Form
=====================================

From: ${userName}
Email: ${userEmail}
Subject: ${subject || 'No subject'}

Message:
${message}

=====================================
Sent via FASTSync Contact Form
    `.trim();
    
    // Method 1: Open default email client (Works immediately)
    const mailtoLink = `mailto:${adminEmail}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    window.location.href = mailtoLink;
    
    // Save query to localStorage (for admin tracking)
    saveQuery({
        id: Date.now(),
        userName: userName,
        userEmail: userEmail,
        subject: subject,
        message: message,
        date: new Date().toISOString()
    });
    
    // Reset form after short delay
    setTimeout(() => {
        submitBtn.textContent = '✓ Message Sent!';
        submitBtn.style.background = 'rgba(34, 197, 94, 0.8)';
        
        setTimeout(() => {
            contactForm.reset();
            submitBtn.textContent = originalText;
            submitBtn.style.background = '';
            submitBtn.disabled = false;
            
            alert('✓ Your message has been sent! We will get back to you soon.');
        }, 2000);
    }, 1000);
});

// Save queries to localStorage for tracking
function saveQuery(query) {
    let queries = JSON.parse(localStorage.getItem('fastsync_queries')) || [];
    queries.push(query);
    localStorage.setItem('fastsync_queries', JSON.stringify(queries));
    console.log('Query saved:', query);
}
