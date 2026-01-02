// 1. Firebase Configuration
const firebaseConfig = {
    apiKey: "YOUR_ACTUAL_API_KEY",
    authDomain: "fastsync.firebaseapp.com",
    // FIX: Note the colon ":" and NO "const" here. 
    // REPLACE THIS URL with the one from your Firebase Console!
    databaseURL: "https://fastsync-8b20e-default-rtdb.firebaseio.com/",
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

    // Connect to the Cloud Database
    database.ref('profiles').on('value', (snapshot) => {
        const data = snapshot.val();
        // Convert the cloud data into a list we can show
        partners = data ? Object.entries(data).map(([id, val]) => ({...val, id})) : [];
        displayPartners();
    });

    if (document.getElementById('profileBtn') && userName) {
        document.getElementById('profileBtn').textContent = userName;
    }
}

// 4. Show the Cards (Like Ammad's Card)
function displayPartners() {
    const grid = document.getElementById('partnersGrid');
    if (!grid) return;

    document.getElementById('partnersCount').textContent = partners.length;
    grid.innerHTML = '';

    partners.forEach(p => {
        const isMine = p.email === userEmail; // Check if this is YOUR card
        const card = document.createElement('div');
        card.className = 'partner-card';

        // Matching the design in your screenshot
        card.innerHTML = `
            <span class="status-badge ${p.availability === 'available' ? 'available' : 'found'}">
                ${p.availability === 'available' ? '✓ Available' : '✗ Partnered'}
            </span>
            <div class="partner-header">
                <div class="partner-name">${p.fullName}</div>
                <div class="partner-roll" style="color: #a855f7;">${p.rollNumber}</div>
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
                        <button class="btn-submit" onclick="editProfile('${p.id}')" style="flex:1;">✏️ Edit</button>
                        <button class="btn-submit" onclick="deleteProfile('${p.id}')" style="flex:1; background: #ef4444;">🗑️ Delete</button>
                    </div>` : 
                    `<button class="btn-submit" onclick="contactPartner('${p.fullName}')" style="width:100%; background: #6366f1;">📧 Contact</button>`
                }
            </div>
        `;
        grid.appendChild(card);
    });
}

// 5. Delete Logic
window.deleteProfile = function(id) {
    if (confirm("Remove your profile from the list?")) {
        database.ref('profiles/' + id).remove()
            .then(() => alert("Profile removed successfully."))
            .catch(err => alert("Error: " + err.message));
    }
};

// 6. Form Submission (Add or Update)
const profileForm = document.getElementById('profileForm');
if (profileForm) {
    profileForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const id = document.getElementById('profileId').value || Date.now().toString();
        
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

        database.ref('profiles/' + id).set(profileData)
            .then(() => {
                alert("Success! Your profile is now live.");
                profileForm.reset();
                document.getElementById('profileId').value = '';
            });
    });
}

init();
