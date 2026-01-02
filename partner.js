// 1. Firebase Configuration
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",
  authDomain: "fastsync.firebaseapp.com",
  // FIX: Do NOT use the word 'const' here. Use a colon :
  databaseURL: "https://your-project-id-default-rtdb.firebaseio.com/", 
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

function init() {
    if (!localStorage.getItem('isLoggedIn')) {
        window.location.href = 'login.html';
        return;
    }

    // Pull data from Cloud
    database.ref('profiles').on('value', (snapshot) => {
        const data = snapshot.val();
        partners = data ? Object.values(data) : [];
        displayPartners();
    });

    const profileBtn = document.getElementById('profileBtn');
    if (profileBtn && userName) profileBtn.textContent = userName;

    const emailInput = document.getElementById('email');
    if (emailInput && userEmail) emailInput.value = userEmail;
}

function displayPartners(filteredData = null) {
    const grid = document.getElementById('partnersGrid');
    if (!grid) return;

    const data = filteredData || partners;
    document.getElementById('partnersCount').textContent = data.length;
    grid.innerHTML = '';

    data.forEach(p => {
        const isMine = p.email === userEmail; // Security: Check if card belongs to you
        const card = document.createElement('div');
        card.className = 'partner-card';

        // Same design as Ammad's card
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
            <p class="partner-bio" style="font-size: 0.9em; margin-top: 10px; opacity: 0.8;">${p.bio || ''}</p>
            
            <div class="profile-actions" style="margin-top: 15px;">
                ${isMine ? 
                    `<div style="display: flex; gap: 10px;">
                        <button class="btn-submit" onclick="editProfile('${p.id}')" style="flex:1; padding: 8px;">✏️ Edit</button>
                        <button class="btn-submit" onclick="deleteProfile('${p.id}')" style="flex:1; padding: 8px; background: #ef4444;">🗑️ Delete</button>
                    </div>` : 
                    `<button class="btn-submit" onclick="alert('Contacting ${p.fullName}')" style="width:100%; padding: 8px; background: #6366f1;">📧 Contact</button>`
                }
            </div>
        `;
        grid.appendChild(card);
    });
}

// Function to Delete Profile from Cloud
window.deleteProfile = function(id) {
    if (confirm("Are you sure? This will remove your card for everyone.")) {
        database.ref('profiles/' + id).remove()
            .then(() => alert("✅ Profile deleted!"))
            .catch((err) => alert("❌ Error: " + err.message));
    }
};

window.editProfile = function(id) {
    const p = partners.find(item => item.id == id);
    if (!p) return;
    document.getElementById('profileId').value = p.id;
    document.getElementById('fullName').value = p.fullName;
    document.getElementById('bio').value = p.bio;
    document.querySelector('.add-profile-section').scrollIntoView({ behavior: 'smooth' });
};

const profileForm = document.getElementById('profileForm');
if (profileForm) {
    profileForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const id = document.getElementById('profileId').value || Date.now().toString();
        const formData = {
            id: id,
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

        database.ref('profiles/' + id).set(formData)
            .then(() => {
                alert('✅ Profile Updated!');
                profileForm.reset();
            });
    });
}

init();
