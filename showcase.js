// showcase.js - TikTok-Style Project Showcase

// Firebase Configuration
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "fastsync.firebaseapp.com",
    databaseURL: "https://fastsync-8b20e-default-rtdb.firebaseio.com/",
    projectId: "fastsync",
    storageBucket: "fastsync.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const database = firebase.database();
const currentUser = JSON.parse(localStorage.getItem('loggedInUser'));
const userId = currentUser ? emailToId(currentUser.email) : null;

let showcases = [];
let currentFilter = 'all';
let currentVideoIndex = 0;

// Helper function
function emailToId(email) {
    return email.replace(/[.@]/g, '_');
}

// Load showcases
function loadShowcases() {
    database.ref('project_showcases').on('value', (snapshot) => {
        showcases = [];
        snapshot.forEach((childSnapshot) => {
            showcases.push({
                id: childSnapshot.key,
                ...childSnapshot.val()
            });
        });
        
        // Sort by newest first
        showcases.sort((a, b) => b.createdAt - a.createdAt);
        
        displayShowcases();
    });
}

// Display showcases
function displayShowcases() {
    const container = document.getElementById('showcaseContainer');
    const filterBar = document.getElementById('filterBar');
    
    // Filter showcases
    let filtered = showcases;
    if (currentFilter !== 'all') {
        if (currentFilter === 'trending') {
            filtered = showcases.filter(s => s.likes > 5).sort((a, b) => b.likes - a.likes);
        } else {
            filtered = showcases.filter(s => 
                s.course === currentFilter || 
                s.tags.includes(currentFilter)
            );
        }
    }
    
    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="no-videos">
                <i class="bi bi-film"></i>
                <h3>No Projects Found</h3>
                <p>Try a different filter or be the first to upload!</p>
            </div>
        `;
        return;
    }
    
    // Render video items
    container.innerHTML = filtered.map((showcase, index) => {
        const liked = userId && showcase.likedBy && showcase.likedBy[userId];
        
        return `
            <div class="video-item" data-index="${index}">
                <div class="video-wrapper">
                    <video 
                        class="project-video" 
                        src="${showcase.videoUrl}" 
                        loop
                        playsinline
                        data-id="${showcase.id}"
                        onclick="togglePlay(this)"
                    ></video>
                    
                    <div class="video-overlay"></div>
                    
                    <div class="play-pause-overlay" id="playPause-${index}">
                        <i class="bi bi-pause-fill"></i>
                    </div>
                    
                    <div class="video-info">
                        <div class="user-info">
                            <div class="user-avatar">${showcase.userAvatar}</div>
                            <span class="user-name">@${showcase.userName}</span>
                        </div>
                        
                        <h2 class="project-title">${showcase.title}</h2>
                        <p class="project-description">${showcase.description}</p>
                        
                        <div class="project-tags">
                            <div class="tag">📚 ${showcase.course}</div>
                            ${showcase.tags.map(tag => `<div class="tag">#${tag}</div>`).join('')}
                        </div>
                    </div>
                    
                    <div class="action-sidebar">
                        <div class="action-btn ${liked ? 'liked' : ''}" onclick="toggleLike('${showcase.id}')">
                            <i class="bi ${liked ? 'bi-heart-fill' : 'bi-heart'}"></i>
                            <span class="action-count" id="likes-${showcase.id}">${showcase.likes || 0}</span>
                        </div>
                        
                        <div class="action-btn" onclick="showComments('${showcase.id}')">
                            <i class="bi bi-chat-dots"></i>
                            <span class="action-count">${showcase.comments || 0}</span>
                        </div>
                        
                        <div class="action-btn" onclick="shareProject('${showcase.id}')">
                            <i class="bi bi-share"></i>
                            <span class="action-count">Share</span>
                        </div>
                        
                        <div class="action-btn">
                            <i class="bi bi-eye"></i>
                            <span class="action-count">${showcase.views || 0}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    // Setup intersection observer for auto-play
    setupVideoObserver();
}

// Setup Intersection Observer for auto-play
function setupVideoObserver() {
    const options = {
        root: document.getElementById('showcaseContainer'),
        threshold: 0.75
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const video = entry.target.querySelector('video');
            if (entry.isIntersecting) {
                video.play();
                incrementViews(video.dataset.id);
            } else {
                video.pause();
            }
        });
    }, options);
    
    document.querySelectorAll('.video-item').forEach(item => {
        observer.observe(item);
    });
}

// Toggle play/pause
function togglePlay(video) {
    const index = video.closest('.video-item').dataset.index;
    const overlay = document.getElementById(`playPause-${index}`);
    
    if (video.paused) {
        video.play();
        overlay.querySelector('i').className = 'bi bi-pause-fill';
    } else {
        video.pause();
        overlay.querySelector('i').className = 'bi bi-play-fill';
    }
    
    // Show overlay briefly
    overlay.classList.add('show');
    setTimeout(() => {
        overlay.classList.remove('show');
    }, 500);
}

// Increment views
function incrementViews(showcaseId) {
    const viewed = sessionStorage.getItem(`viewed_${showcaseId}`);
    if (!viewed) {
        database.ref(`project_showcases/${showcaseId}/views`).transaction((views) => {
            return (views || 0) + 1;
        });
        sessionStorage.setItem(`viewed_${showcaseId}`, 'true');
    }
}

// Toggle like
function toggleLike(showcaseId) {
    if (!userId) {
        alert('❌ Please login to like projects');
        return;
    }
    
    const likeRef = database.ref(`project_showcases/${showcaseId}/likedBy/${userId}`);
    const likesRef = database.ref(`project_showcases/${showcaseId}/likes`);
    
    likeRef.once('value', (snapshot) => {
        if (snapshot.exists()) {
            // Unlike
            likeRef.remove();
            likesRef.transaction((likes) => Math.max((likes || 1) - 1, 0));
        } else {
            // Like
            likeRef.set(true);
            likesRef.transaction((likes) => (likes || 0) + 1);
        }
    });
}

// Show comments (placeholder)
function showComments(showcaseId) {
    alert('💬 Comments feature coming soon!');
    // TODO: Implement comments modal
}

// Share project
function shareProject(showcaseId) {
    const url = `${window.location.origin}/showcase.html?id=${showcaseId}`;
    
    if (navigator.share) {
        navigator.share({
            title: 'Check out this project on FASTSync!',
            url: url
        });
    } else {
        // Fallback: Copy to clipboard
        navigator.clipboard.writeText(url).then(() => {
            alert('✅ Link copied to clipboard!');
        });
    }
}

// Filter chips
document.querySelectorAll('.filter-chip').forEach(chip => {
    chip.addEventListener('click', () => {
        document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        currentFilter = chip.dataset.filter;
        displayShowcases();
    });
});

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault();
        const container = document.getElementById('showcaseContainer');
        const direction = e.key === 'ArrowUp' ? -1 : 1;
        container.scrollBy({
            top: window.innerHeight * direction,
            behavior: 'smooth'
        });
    }
});

// Initialize
loadShowcases();

console.log('✅ TikTok-Style Showcase loaded!');
