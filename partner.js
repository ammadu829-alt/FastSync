// 1. Firebase Configuration
const firebaseConfig = {
    apiKey: "YOUR_ACTUAL_API_KEY",
    authDomain: "fastsync.firebaseapp.com",
    // Paste your real URL here to fix the console warning!
    databaseURL: "https://your-project-id-default-rtdb.firebaseio.com/", 
    projectId: "fastsync",
    storageBucket: "fastsync.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef12345"
};

// 2. Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const database = firebase.database();

let partners = [];
const userEmail = localStorage.getItem('userEmail');
const userName = localStorage.getItem('userName');

// 3. Start the App
function init() {
    if (!localStorage.getItem('isLoggedIn')) {
        window.location.href = 'login.html';
        return;
    }

    // Connect to Cloud and Listen for Changes
    database.ref('profiles').on('value', (snapshot) => {
        const data = snapshot.val();
        // We store the original ID from Firebase so we can edit it later
        partners = data ? Object.entries(data).map(([id, val]) => ({...val, id})) : [];
        displayPartners();
    });

    if (document.getElementById('profileBtn') && userName) {
        document.getElementById('profileBtn').textContent = userName;
    }
}

// 4. Show the Cards (Design matches Ammad's card)
function displayPartners() {
    const grid = document.getElementById('partnersGrid');
    if (!grid) return;

    document.getElementById('partnersCount').textContent = partners.length;
    grid.innerHTML = '';

    partners.forEach(p => {
        const isMine = p.email === userEmail; 
        const card = document.createElement('div');
        card.className = 'partner-card';

        card.innerHTML = `
            <span class="status-badge ${p.availability === 'available' ? 'available' : 'found'}">
                ${p.availability === 'available' ? '✓ Available' : '✗ Partnered'}
            </span>
            <div class="partner-header">
                <div class="partner-name">${p.fullName}</div>
                <div class="partner-roll" style="color: #a855f7; font-weight:bold;">${p.rollNumber}</div>
            </div>
            <div class="partner-info">
                <div class="info-item"><span class="info-label">Email:</span> <span>${p.email}</span></div>
                <div class="info-item"><span class="info-label">Phone:</span> <span>${p.phone}</span></div>
                <div class="info-item"><span class="info-label">Semester:</span> <span>${p.semester}</span></div>
                <div class="info-item"><span class="info-label">Session:</span> <span>${p.session}</span></div>
                <div class="info-item"><span class="info-label">Course:</span> <span>${p.course}</span></div>
            </div>
            <p class="partner-bio" style="margin-top: 10px; font-size: 0.9em;">${p.bio || ''}</p>
            
            <div class="profile-actions" style="margin-top: 15px;">
                ${isMine ? 
                    `<div style="display: flex; gap: 10px;">
                        <button class="btn-submit" onclick="editProfile('${p.id}')" style="flex:1;">✏️ Edit My Profile</button>
                        <button class="btn-submit" onclick="deleteProfile('${p.id}')" style="flex:1; background: #ef4444;">🗑️ Delete</button>
                    </div>` : 
                    `<button class="btn-submit" onclick="alert('Opening Contact...') style="width:100%; background: #6366f1;">📧 Contact</button>`
                }
            </div>
        `;
        grid.appendChild(card);
    });
}

// 5. ENABLED: The Edit Function
window.editProfile = function(id) {
    // Find the profile data in our list
    const p = partners.find(item => item.id === id);
    if (!p) return;

    // 1. Fill the hidden ID field (so we update the SAME card, not make a new one)
    document.getElementById('profileId').value = p.id;

    // 2. Fill all form inputs
    document.getElementById('fullName').value = p.fullName || '';
    document.getElementById('email').value = p.email || '';
    document.getElementById('phone').value = p.phone || '';
    document.getElementById('rollNumber').value = p.rollNumber || '';
    document.getElementById('semester').value = p.semester || '';
    document.getElementById('session').value = p.session || '';
    document.getElementById('course').value = p.course || '';
    document.getElementById('availability').value = p.availability || 'available';
    document.getElementById('bio').value = p.bio || '';

    // 3. Change button text to show we are editing
    document.getElementById('submitBtn').textContent = "Update My Profile";

    // 4. Scroll smoothly back to the form
    document.getElementById('profileSection').scrollIntoView({ behavior: 'smooth' });
};

// 6. Delete Logic
window.deleteProfile = function(id) {
    if (confirm("Remove your profile from the list?")) {
        database.ref('profiles/' + id).remove()
            .then(() => alert("Profile removed successfully."))
            .catch(err => alert("Error: " + err.message));
    }
};

// 7. Form Submission (Handles both ADD and EDIT)
const profileForm = document.getElementById('profileForm');
if (profileForm) {
    profileForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Use existing ID if editing, otherwise create a new one
        const existingId = document.getElementById('profileId').value;
        const id = existingId || Date.now().toString();
        
        const profileData = {
            fullName: document.getElementById('fullName').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            rollNumber: document.getElementById('rollNumber').value,
            semester: document.getElementById('semester').value,
            session: document.getElementById('session').value,
            course: document.getElementById('course').value,
            availability: document.getElementById('availability').value,
            bio: document.getElementById('bio').value
        };

        // Save to Cloud
        database.ref('profiles/' + id).set(profileData)
            .then(() => {
                alert(existingId ? "✅ Profile Updated!" : "✅ Profile Created!");
                profileForm.reset();
                document.getElementById('profileId').value = '';
                document.getElementById('submitBtn').textContent = "Add My Profile";
            });
    });
}

init();
