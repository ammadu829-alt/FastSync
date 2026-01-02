// 1. Firebase Configuration (Ensure these match your Firebase Console exactly)
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "fastsync.firebaseapp.com",
  databaseURL: "https://fastsync.firebaseio.com",
  projectId: "fastsync",
  storageBucket: "fastsync.appspot.com",
  messagingSenderId: "12345",
  appId: "1:12345:web:6789"
};

// 2. Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const database = firebase.database();

let partners = [];
const userEmail = localStorage.getItem('userEmail');
const userName = localStorage.getItem('userName');

// Initialize
function init() {
    // Check Login (Session still uses localStorage for security)
    if (!localStorage.getItem('isLoggedIn')) {
        window.location.href = 'login.html';
        return;
    }

    // 3. Load Data from Firebase (Replaces local storage to show all users)
    const profilesRef = database.ref('profiles');
    profilesRef.on('value', (snapshot) => {
        const data = snapshot.val();
        partners = [];
        if (data) {
            // Convert Firebase object to array
            Object.keys(data).forEach(key => {
                partners.push(data[key]);
            });
        }
        displayPartners(); // Refresh UI automatically when data changes
    });

    // Setup Navigation
    const profileBtn = document.getElementById('profileBtn');
    if (profileBtn) {
        if (userName) profileBtn.textContent = userName;
        profileBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const myProfile = partners.find(p => p.email === userEmail);
            if (myProfile) editProfile(myProfile.id);
            document.querySelector('.add-profile-section').scrollIntoView({ behavior: 'smooth' });
        });
    }

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.clear();
            window.location.href = 'login.html';
        });
    }

    const emailInput = document.getElementById('email');
    if (emailInput && userEmail) emailInput.value = userEmail;
}

// Display Cards (Matching your screenshot design exactly)
function displayPartners(filteredData = null) {
    const grid = document.getElementById('partnersGrid');
    if (!grid) return;

    const data = filteredData || partners;
    const countEl = document.getElementById('partnersCount');
    if (countEl) countEl.textContent = data.length;

    grid.innerHTML = '';

    data.forEach(p => {
        const isMine = p.email === userEmail;
        const card = document.createElement('div');
        card.className = 'partner-card';

        card.innerHTML = `
            <span class="status-badge ${p.availability === 'available' ? 'available' : 'found'}">
                ${p.availability === 'available' ? '✓ Available' : '✗ Partnered'}
            </span>
            <div class="partner-header">
                <div class="partner-name">${p.fullName}</div>
                <div class="partner-roll" style="color: #a855f7; font-weight: bold;">${p.rollNumber}</div>
            </div>
            <div class="partner-info">
                <div class="info-item"><span class="info-label">Email:</span> <span>${p.email}</span></div>
                <div class="info-item"><span class="info-label">Phone:</span> <span>${p.phone}</span></div>
                <div class="info-item"><span class="info-label">Semester:</span> <span>${p.semester}</span></div>
                <div class="info-item"><span class="info-label">Session:</span> <span>${p.session}</span></div>
                <div class="info-item"><span class="info-label">Course:</span> <span>${p.course}</span></div>
            </div>
            ${p.skills ? `<div class="partner-skills"><div class="skills-list">${p.skills.split(',').map(s => `<span class="skill-tag">${s.trim()}</span>`).join('')}</div></div>` : ''}
            <p class="partner-bio" style="font-size: 0.9em; margin-top: 10px; opacity: 0.8;">${p.bio || ''}</p>
            <div class="profile-actions" style="margin-top: 15px;">
                ${isMine ? 
                    `<button class="btn-submit" onclick="editProfile(${p.id})" style="width:100%; padding: 8px;">✏️ Edit My Profile</button>` : 
                    `<button class="btn-submit" onclick="alert('Contacting ${p.fullName}')" style="width:100%; padding: 8px; background: #6366f1;">📧 Contact</button>`
                }
            </div>
        `;
        grid.appendChild(card);
    });
}

// Edit Function
window.editProfile = function(id) {
    const p = partners.find(item => item.id === id);
    if (!p) return;

    document.getElementById('profileId').value = p.id;
    document.getElementById('fullName').value = p.fullName;
    document.getElementById('email').value = p.email;
    document.getElementById('phone').value = p.phone;
    document.getElementById('rollNumber').value = p.rollNumber;
    document.getElementById('semester').value = p.semester;
    document.getElementById('session').value = p.session;
    document.getElementById('course').value = p.course;
    document.getElementById('skills').value = p.skills;
    document.getElementById('bio').value = p.bio;
    document.getElementById('availability').value = p.availability;

    document.querySelector('.add-profile-section h1').textContent = '✏️ Edit Your Profile';
    document.querySelector('.btn-submit').textContent = 'Update My Profile';
    document.querySelector('.add-profile-section').scrollIntoView({ behavior: 'smooth' });
};

// Form Submission (Saves to Firebase Cloud)
const profileForm = document.getElementById('profileForm');
if (profileForm) {
    profileForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const idValue = document.getElementById('profileId').value;
        const id = idValue ? idValue : Date.now().toString(); // Firebase IDs work better as strings

        const formData = {
            id: id,
            fullName: document.getElementById('fullName').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            rollNumber: document.getElementById('rollNumber').value,
            semester: document.getElementById('semester').value,
            session: document.getElementById('session').value,
            course: document.getElementById('course').value,
            skills: document.getElementById('skills').value,
            bio: document.getElementById('bio').value,
            availability: document.getElementById('availability').value
        };

        // Save/Update in Firebase Cloud
        database.ref('profiles/' + id).set(formData)
            .then(() => {
                alert('✅ Profile synchronized globally!');
                profileForm.reset();
                document.getElementById('profileId').value = '';
                document.querySelector('.add-profile-section h1').textContent = 'Create Your Partner Profile';
                document.querySelector('.btn-submit').textContent = 'Add My Profile';
                if (userEmail) document.getElementById('email').value = userEmail;
            })
            .catch((error) => {
                alert('❌ Error saving to cloud: ' + error.message);
            });
    });
}

init();
