// Store partners data (in a real app, this would be in a database)
let partners = JSON.parse(localStorage.getItem('partners')) || [];

// Check if user is logged in
const isLoggedIn = localStorage.getItem('isLoggedIn');
if (!isLoggedIn) {
    window.location.href = 'login.html';
}

// Display user name in profile
const userName = localStorage.getItem('userName');
const profileBtn = document.getElementById('profileBtn');
if (userName) {
    profileBtn.textContent = userName;
}

// Logout functionality
document.getElementById('logoutBtn').addEventListener('click', function(e) {
    e.preventDefault();
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    window.location.href = 'login.html';
});

// Profile Form Submission
const profileForm = document.getElementById('profileForm');
profileForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const formData = {
        id: Date.now(),
        fullName: document.getElementById('fullName').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        rollNumber: document.getElementById('rollNumber').value,
        semester: document.getElementById('semester').value,
        session: document.getElementById('session').value,
        course: document.getElementById('course').value,
        skills: document.getElementById('skills').value,
        bio: document.getElementById('bio').value,
        availability: document.getElementById('availability').value,
        dateAdded: new Date().toISOString()
    };

    // Add to partners array
    partners.push(formData);
    
    // Save to localStorage
    localStorage.setItem('partners', JSON.stringify(partners));

    // Show success message
    alert('✓ Your profile has been added successfully!');

    // Reset form
    profileForm.reset();

    // Refresh display
    displayPartners();
});

// Display Partners Function
function displayPartners(filteredPartners = null) {
    const partnersGrid = document.getElementById('partnersGrid');
    const noResults = document.getElementById('noResults');
    const partnersCount = document.getElementById('partnersCount');

    const dataToDisplay = filteredPartners || partners;

    partnersCount.textContent = dataToDisplay.length;

    if (dataToDisplay.length === 0) {
        partnersGrid.style.display = 'none';
        noResults.style.display = 'block';
        return;
    }

    partnersGrid.style.display = 'grid';
    noResults.style.display = 'none';
    partnersGrid.innerHTML = '';

    dataToDisplay.forEach(partner => {
        const card = document.createElement('div');
        card.className = 'partner-card';
        
        const statusClass = partner.availability === 'available' ? 'available' : 'found';
        const statusText = partner.availability === 'available' ? '✓ Available' : '✗ Partnered';

        const skillsArray = partner.skills ? partner.skills.split(',').map(s => s.trim()).filter(s => s) : [];
        const skillsHTML = skillsArray.length > 0 ? 
            `<div class="partner-skills">
                <div class="skills-label">Skills:</div>
                <div class="skills-list">
                    ${skillsArray.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
                </div>
            </div>` : '';

        const bioHTML = partner.bio ? 
            `<div class="partner-bio">${partner.bio}</div>` : '';

        card.innerHTML = `
            <span class="status-badge ${statusClass}">${statusText}</span>
            
            <div class="partner-header">
                <div class="partner-name">${partner.fullName}</div>
                <div class="partner-roll">${partner.rollNumber}</div>
            </div>

            <div class="partner-info">
                <div class="info-item">
                    <span class="info-label">Email:</span>
                    <span>${partner.email}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Phone:</span>
                    <span>${partner.phone}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Semester:</span>
                    <span>${partner.semester}${getOrdinal(partner.semester)}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Session:</span>
                    <span>${partner.session}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Course:</span>
                    <span>${partner.course}</span>
                </div>
            </div>

            ${skillsHTML}
            ${bioHTML}

            <div class="partner-contact">
                <button class="btn-contact" onclick="openMessageModal('${partner.email}', '${partner.fullName}', '${partner.phone}')">
                    📧 Contact ${partner.fullName.split(' ')[0]}
                </button>
            </div>
        `;

        partnersGrid.appendChild(card);
    });
}

// Helper function to get ordinal suffix
function getOrdinal(n) {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return s[(v - 20) % 10] || s[v] || s[0];
}

// Contact Partner Function - Old (kept for backward compatibility)
function contactPartner(email, name) {
    const subject = encodeURIComponent(`Project Partner Request - FASTSync`);
    const body = encodeURIComponent(`Hi ${name},\n\nI found your profile on FASTSync and would like to discuss partnering for our project.\n\nLooking forward to connecting!\n\nBest regards`);
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
}

// New Enhanced Contact System with Modal
let currentPartnerEmail = '';
let currentPartnerPhone = '';
let currentPartnerName = '';

function openMessageModal(email, name, phone) {
    currentPartnerEmail = email;
    currentPartnerPhone = phone;
    currentPartnerName = name;
    
    document.getElementById('partnerNameModal').textContent = name;
    document.getElementById('messageModal').style.display = 'block';
    
    // Pre-fill sender info if available
    const userName = localStorage.getItem('userName');
    const userEmail = localStorage.getItem('userEmail');
    if (userName) document.getElementById('senderName').value = userName;
    if (userEmail) document.getElementById('senderEmail').value = userEmail;
}

// Close modal
const closeModal = document.querySelector('.close-modal');
closeModal.onclick = function() {
    document.getElementById('messageModal').style.display = 'none';
}

window.onclick = function(event) {
    const modal = document.getElementById('messageModal');
    if (event.target == modal) {
        modal.style.display = 'none';
    }
}

// Send Message via Email
document.getElementById('messageForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const senderName = document.getElementById('senderName').value;
    const senderEmail = document.getElementById('senderEmail').value;
    const message = document.getElementById('messageText').value;
    
    const subject = encodeURIComponent(`Project Partner Request from ${senderName} - FASTSync`);
    const body = encodeURIComponent(`Hi ${currentPartnerName},\n\n${message}\n\n---\nFrom: ${senderName}\nEmail: ${senderEmail}\n\nSent via FASTSync Partner Finder`);
    
    window.location.href = `mailto:${currentPartnerEmail}?subject=${subject}&body=${body}`;
    
    document.getElementById('messageModal').style.display = 'none';
});

// WhatsApp Contact
document.getElementById('whatsappBtn').addEventListener('click', function() {
    const message = document.getElementById('messageText').value || `Hi ${currentPartnerName}! I found your profile on FASTSync and would like to partner up for our project.`;
    
    // Remove any non-digit characters from phone
    const cleanPhone = currentPartnerPhone.replace(/\D/g, '');
    
    const whatsappURL = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappURL, '_blank');
});

// Call Partner
document.getElementById('callBtn').addEventListener('click', function() {
    window.location.href = `tel:${currentPartnerPhone}`;
});

// Filter Functionality
const filterSession = document.getElementById('filterSession');
const filterCourse = document.getElementById('filterCourse');
const filterAvailability = document.getElementById('filterAvailability');
const resetFilters = document.getElementById('resetFilters');

function applyFilters() {
    const sessionValue = filterSession.value;
    const courseValue = filterCourse.value;
    const availabilityValue = filterAvailability.value;

    let filtered = partners;

    if (sessionValue) {
        filtered = filtered.filter(p => p.session === sessionValue);
    }

    if (courseValue) {
        filtered = filtered.filter(p => p.course === courseValue);
    }

    if (availabilityValue) {
        filtered = filtered.filter(p => p.availability === availabilityValue);
    }

    displayPartners(filtered);
}

filterSession.addEventListener('change', applyFilters);
filterCourse.addEventListener('change', applyFilters);
filterAvailability.addEventListener('change', applyFilters);

resetFilters.addEventListener('click', function() {
    filterSession.value = '';
    filterCourse.value = '';
    filterAvailability.value = '';
    displayPartners();
});

// Auto-fill email from logged in user
const userEmail = localStorage.getItem('userEmail');
if (userEmail) {
    document.getElementById('email').value = userEmail;
}

// Initial display
displayPartners();
