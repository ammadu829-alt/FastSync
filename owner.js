// Animated Network Background
const canvas = document.getElementById('ownerCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Particle system for network effect
class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.radius = Math.random() * 2 + 1;
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
        ctx.fillStyle = 'rgba(99, 102, 241, 0.5)';
        ctx.fill();
    }
}

const particles = [];
const particleCount = 80;

for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
}

function connectParticles() {
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 120) {
                ctx.beginPath();
                ctx.strokeStyle = `rgba(99, 102, 241, ${0.2 * (1 - distance / 120)})`;
                ctx.lineWidth = 1;
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

// Resize canvas on window resize
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

// Profile Image Error Handling (Updated for profile.jpeg)
const profileImg = document.getElementById('profileImg');
if (profileImg) {
    profileImg.addEventListener('error', function() {
        this.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%236366f1" width="200" height="200"/%3E%3Ctext x="50%25" y="50%25" font-size="80" fill="white" text-anchor="middle" dy=".3em"%3EAD%3C/text%3E%3C/svg%3E';
    });
}

// Intersection Observer for scroll animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe all detail sections for animation
document.querySelectorAll('.detail-section').forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(30px)';
    section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(section);
});

// Animate info items on load
window.addEventListener('load', () => {
    const infoItems = document.querySelectorAll('.info-item');
    infoItems.forEach((item, index) => {
        setTimeout(() => {
            item.style.opacity = '1';
            item.style.transform = 'translateX(0)';
        }, index * 100);
    });
});

// Skill badges animation
const skillBadges = document.querySelectorAll('.skill-badge');
skillBadges.forEach((badge, index) => {
    badge.style.opacity = '0';
    badge.style.transform = 'scale(0.8)';
    badge.style.transition = 'all 0.4s ease';
    
    setTimeout(() => {
        badge.style.opacity = '1';
        badge.style.transform = 'scale(1)';
    }, 800 + (index * 80));
});

// Vision cards hover effect enhancement
const visionCards = document.querySelectorAll('.vision-card');
visionCards.forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-10px) scale(1.02)';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
    });
});

// Contact buttons hover effect with ripple
const contactButtons = document.querySelectorAll('.contact-btn');
contactButtons.forEach(btn => {
    btn.addEventListener('click', function(e) {
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('ripple');
        
        this.appendChild(ripple);
        
        setTimeout(() => ripple.remove(), 600);
    });
});

// Add ripple CSS dynamically
const style = document.createElement('style');
style.textContent = `
    .contact-btn {
        position: relative;
        overflow: hidden;
    }
    
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.5);
        transform: scale(0);
        animation: ripple-animation 0.6s ease-out;
        pointer-events: none;
    }
    
    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Navbar scroll effect
let lastScroll = 0;
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll <= 0) {
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.boxShadow = '0 2px 30px rgba(0, 0, 0, 0.2)';
    }
    
    if (currentScroll > lastScroll && currentScroll > 100) {
        navbar.style.transform = 'translateY(-100%)';
    } else {
        navbar.style.transform = 'translateY(0)';
    }
    
    lastScroll = currentScroll;
});

// Parallax effect on scroll
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const ownerCard = document.querySelector('.owner-card');
    
    if (ownerCard) {
        ownerCard.style.transform = `translateY(${scrolled * 0.05}px)`;
    }
});

// Add smooth scrolling to all links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Profile image hover effect
const profileImageContainer = document.querySelector('.profile-image-container');
if (profileImageContainer) {
    profileImageContainer.addEventListener('mouseenter', function() {
        this.querySelector('.profile-image').style.transform = 'scale(1.1) rotate(5deg)';
    });
    
    profileImageContainer.addEventListener('mouseleave', function() {
        this.querySelector('.profile-image').style.transform = 'scale(1) rotate(0deg)';
    });
}

// Add typing effect to subtitle
const subtitle = document.querySelector('.subtitle');
if (subtitle) {
    const text = subtitle.textContent;
    subtitle.textContent = '';
    let i = 0;
    
    const typeWriter = () => {
        if (i < text.length) {
            subtitle.textContent += text.charAt(i);
            i++;
            setTimeout(typeWriter, 50);
        }
    };
    
    setTimeout(typeWriter, 500);
}

// Easter egg - Konami code
let konamiCode = [];
const konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

document.addEventListener('keydown', (e) => {
    konamiCode.push(e.key);
    konamiCode = konamiCode.slice(-10);
    
    if (konamiCode.join(',') === konamiSequence.join(',')) {
        document.body.style.animation = 'rainbow 2s linear infinite';
        setTimeout(() => {
            document.body.style.animation = '';
        }, 5000);
    }
});

// Add rainbow animation
const rainbowStyle = document.createElement('style');
rainbowStyle.textContent = `
    @keyframes rainbow {
        0% { filter: hue-rotate(0deg); }
        100% { filter: hue-rotate(360deg); }
    }
`;
document.head.appendChild(rainbowStyle);

// Console message
console.log('%c👋 Hello there!', 'font-size: 20px; color: #6366f1; font-weight: bold;');
console.log('%cWelcome to FASTSync - Created by Ammad ud Din', 'font-size: 14px; color: #666;');
console.log('%cInterested in the code? Check out the source!', 'font-size: 12px; color: #999;');

// Performance monitoring
if ('PerformanceObserver' in window) {
    const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
            if (entry.duration > 50) {
                console.warn('Slow operation detected:', entry.name, entry.duration + 'ms');
            }
        }
    });
    observer.observe({ entryTypes: ['measure'] });
}

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('Owner page loaded successfully! ✨');
    
    // Add fade-in animation to owner card
    const ownerCard = document.querySelector('.owner-card');
    if (ownerCard) {
        ownerCard.style.opacity = '0';
        ownerCard.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            ownerCard.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
            ownerCard.style.opacity = '1';
            ownerCard.style.transform = 'translateY(0)';
        }, 100);
    }
});
