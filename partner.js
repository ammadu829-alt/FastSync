// 1. Firebase Configuration
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "fastsync.firebaseapp.com",
    // FIX: Use a colon (:) and no "const" inside this object
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

    // Pull data from the Cloud and listen for changes
    database.ref('profiles').on('value', (snapshot) => {
        const data = snapshot.val();
        // Convert Firebase object into an array with IDs
        partners = data ? Object.entries(data).map(([id, val]) => ({...val, id})) : [];
        displayPartners();
    });

    const profileBtn = document.getElementById('profileBtn');
    if (profileBtn && userName) profileBtn.textContent = userName;
}

// 4. Display Cards (Matches design in image_df442b.png)
function displayPartners() {
    const grid = document.getElementById('partnersGrid');
    const countText = document.getElementById('partnersCount');
    
    // FIX: This check prevents the "Cannot set properties of null" error
    if (!grid) return; 

    if (countText) countText.textContent = partners.length;
    grid.innerHTML = '';

    partners.forEach(p => {
        const isMine = p.email === userEmail; // Security: Check if this card belongs to you
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
                <div class="info-item"><span class="info-label">Course:</span> <span>${p.course}</span></div>
            </div>
            <p class="partner-bio" style="margin-top: 10px; font-size: 0.9em; opacity: 0.8;">${p.bio || ''}</p>
            
            <div class="profile-actions" style="margin-top: 15px;">
                ${isMine ? 
                    `<div style="display: flex; gap: 10px;">
                        <button class="btn-submit" onclick="editProfile('${p.id}')" style="flex:1;">✏️ Edit My Profile</button>
                        <button class="btn-submit" onclick="deleteProfile('${p.id}')" style="flex:1; background: #ef4444;">🗑️ Delete</button>
                    </div>` : 
                    `<button class="btn-submit" onclick="alert('Contacting ${p.fullName}...')" style="width:100%; background: #6366f1;">📧 Contact</button>`
                }
            </div>
        `;
        grid.appendChild(card);
    });
}

// 5. ENABLED: The Edit Function
window.editProfile = function(id) {
    const p = partners.find(item => item.id === id);
    if (!p) return;

    // Scroll to form and fill the hidden ID field
    const formSection = document.getElementById('profileSection') || document.querySelector('.add-profile-section');
    if (formSection) formSection.scrollIntoView({ behavior: 'smooth' });

    if (document.getElementById('profileId')) document.getElementById('profileId').value = p.id;

    // Fill the form fields
    const fields = ['fullName', 'email', 'phone', 'rollNumber', 'semester', 'session', 'course', 'availability', 'bio'];
    fields.forEach(f => {
        const input = document.getElementById(f);
        if (input) input.value = p[f] || '';
    });

    if (document.getElementById('submitBtn')) document.getElementById('submitBtn').textContent = "Update My Profile";
};

// 6. The Delete Function
window.deleteProfile = function(id) {
    if (confirm("Are you sure you want to delete your profile?")) {
        database.ref('profiles/' + id).remove()
            .then(() => alert("✅ Profile deleted!"))
            .catch(err => alert("❌ Error: " + err.message));
    }
};

// 7. Handle Form Submission (Add or Update)
const profileForm = document.getElementById('profileForm');
if (profileForm) {
    profileForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const existingId = document.getElementById('profileId') ? document.getElementById('profileId').value : '';
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

        database.ref('profiles/' + id).set(profileData).then(() => {
            alert(existingId ? "✅ Profile Updated!" : "✅ Profile Added!");
            profileForm.reset();
            if (document.getElementById('profileId')) document.getElementById('profileId').value = '';
            if (document.getElementById('submitBtn')) document.getElementById('submitBtn').textContent = "Add My Profile";
        });
    });
}

init();
