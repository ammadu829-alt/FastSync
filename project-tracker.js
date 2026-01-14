// project-tracker.js - Project Timeline & Milestone Tracker

// Firebase Configuration
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "fastsync.firebaseapp.com",
   databaseURL: "https://fastsync-8b20e-default-rtdb.firebaseio.com/", 
    projectId: "fastsync",
    storageBucket: "fastsync.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef12345"
};

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const database = firebase.database();

// Get user info
const userEmail = localStorage.getItem('userEmail');
const userName = localStorage.getItem('userName');
const userId = userEmail ? emailToId(userEmail) : null;

let allProjects = [];
let currentProjectId = null;
let myConnections = [];

// Helper function
function emailToId(email) {
    return email.replace(/[.@]/g, '_');
}

// Initialize
function init() {
    if (!localStorage.getItem('isLoggedIn')) {
        window.location.href = 'login.html';
        return;
    }

    loadUserConnections();
    loadProjects();
}

// Load user's connections for partner selection
function loadUserConnections() {
    if (!userId) return;

    database.ref('connections/' + userId).on('value', (snapshot) => {
        const data = snapshot.val();
        if (data) {
            myConnections = Object.keys(data).filter(id => id !== userId);
        }
        loadPartnerOptions();
    });
}

// Load partner options in dropdown
function loadPartnerOptions() {
    const partnerSelect = document.getElementById('projectPartner');
    if (!partnerSelect) return;

    partnerSelect.innerHTML = '<option value="">Select Partner (Optional)</option>';

    if (myConnections.length === 0) {
        partnerSelect.innerHTML += '<option value="" disabled>No connections yet</option>';
        return;
    }

    // Load partner profiles
    database.ref('profiles').once('value', (snapshot) => {
        const profiles = snapshot.val();
        if (!profiles) return;

        myConnections.forEach(connId => {
            const profile = Object.values(profiles).find(p => emailToId(p.email) === connId);
            if (profile) {
                const option = document.createElement('option');
                option.value = connId;
                option.textContent = `${profile.fullName} (${profile.rollNumber})`;
                partnerSelect.appendChild(option);
            }
        });
    });
}

// Load all projects
function loadProjects() {
    if (!userId) return;

    database.ref('projects').orderByChild('userId').equalTo(userId).on('value', (snapshot) => {
        const data = snapshot.val();
        allProjects = data ? Object.entries(data).map(([id, val]) => ({...val, id})) : [];
        displayProjects();
    });
}

// Display projects
function displayProjects() {
    const grid = document.getElementById('projectsGrid');
    
    if (allProjects.length === 0) {
        grid.innerHTML = `
            <div class="no-projects">
                <div class="no-projects-icon">📁</div>
                <h3>No Projects Yet</h3>
                <p>Create your first project to start tracking milestones</p>
                <button class="btn btn-primary" onclick="openCreateProjectModal()">
                    <i class="bi bi-plus-circle"></i> Create Project
                </button>
            </div>
        `;
        return;
    }

    grid.innerHTML = allProjects.map(project => createProjectCard(project)).join('');
}

// Create project card HTML
function createProjectCard(project) {
    const progress = calculateProjectProgress(project);
    const deadline = new Date(project.deadline);
    const today = new Date();
    const daysLeft = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));
    
    let statusClass = 'status-active';
    let statusText = 'Active';
    let cardClass = 'active';
    
    if (project.status === 'completed') {
        statusClass = 'status-completed';
        statusText = 'Completed';
        cardClass = 'completed';
    } else if (daysLeft < 0) {
        statusClass = 'status-pending';
        statusText = 'Overdue';
    }

    return `
        <div class="project-card ${cardClass}" onclick="viewProject('${project.id}')">
            <div class="project-header">
                <h3 class="project-title">${project.title}</h3>
                <span class="project-status ${statusClass}">${statusText}</span>
            </div>
            
            ${project.partnerName ? `
                <div class="project-partner">
                    <div class="partner-avatar">${project.partnerName.charAt(0)}</div>
                    <span>With ${project.partnerName}</span>
                </div>
            ` : ''}
            
            <div class="project-partner">
                <i class="bi bi-book"></i>
                ${project.course}
            </div>
            
            <div class="project-deadline">
                <i class="bi bi-calendar-event"></i>
                Deadline: ${formatDate(deadline)} ${daysLeft >= 0 ? `(${daysLeft} days left)` : '(Overdue)'}
            </div>
            
            <div class="project-progress">
                <div class="progress">
                    <div class="progress-bar" style="width: ${progress}%"></div>
                </div>
                <div class="progress-text">${progress}% Complete</div>
            </div>
            
            <div class="project-actions" onclick="event.stopPropagation()">
                <button class="btn btn-primary btn-sm" onclick="viewProject('${project.id}')">
                    <i class="bi bi-eye"></i> View
                </button>
                <button class="btn btn-danger btn-sm" onclick="deleteProject('${project.id}', '${project.title}')">
                    <i class="bi bi-trash"></i> Delete
                </button>
            </div>
        </div>
    `;
}

// Calculate project progress
function calculateProjectProgress(project) {
    if (!project.milestones || Object.keys(project.milestones).length === 0) {
        return 0;
    }

    const milestones = Object.values(project.milestones);
    const completed = milestones.filter(m => m.status === 'completed').length;
    return Math.round((completed / milestones.length) * 100);
}

// View project timeline
function viewProject(projectId) {
    currentProjectId = projectId;
    const project = allProjects.find(p => p.id === projectId);
    
    if (!project) return;

    document.getElementById('projectsSection').style.display = 'none';
    document.getElementById('timelineSection').classList.add('active');
    document.getElementById('timelineTitle').textContent = project.title;
    
    loadMilestones(projectId);
}

// Back to projects
function backToProjects() {
    document.getElementById('projectsSection').style.display = 'block';
    document.getElementById('timelineSection').classList.remove('active');
    currentProjectId = null;
}

// Load milestones
function loadMilestones(projectId) {
    database.ref('projects/' + projectId + '/milestones').on('value', (snapshot) => {
        const data = snapshot.val();
        const milestones = data ? Object.entries(data).map(([id, val]) => ({...val, id})) : [];
        
        // Sort by deadline
        milestones.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
        
        displayMilestones(milestones);
    });
}

// Display milestones
function displayMilestones(milestones) {
    const container = document.getElementById('timelineContainer');
    const timeline = container.querySelector('.timeline-line');
    
    if (milestones.length === 0) {
        container.innerHTML = `
            <div class="timeline-line"></div>
            <div class="no-projects">
                <div class="no-projects-icon">📋</div>
                <h3>No Milestones Yet</h3>
                <p>Add your first milestone to track project progress</p>
                <button class="btn btn-primary" onclick="openAddMilestoneModal()">
                    <i class="bi bi-plus-circle"></i> Add Milestone
                </button>
            </div>
        `;
        return;
    }

    const milestonesHTML = milestones.map(milestone => createMilestoneHTML(milestone)).join('');
    container.innerHTML = '<div class="timeline-line"></div>' + milestonesHTML;
}

// Create milestone HTML
function createMilestoneHTML(milestone) {
    const deadline = new Date(milestone.deadline);
    const today = new Date();
    const daysLeft = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));
    
    let statusClass = '';
    let statusText = '';
    let icon = '○';
    
    if (milestone.status === 'completed') {
        statusClass = 'completed';
        statusText = 'Completed';
        icon = '✓';
    } else if (milestone.status === 'in-progress') {
        statusClass = 'in-progress';
        statusText = 'In Progress';
        icon = '⏳';
    } else if (daysLeft < 0) {
        statusClass = 'overdue';
        statusText = 'Overdue';
        icon = '!';
    } else {
        statusText = 'Pending';
        icon = '○';
    }

    const priorityColors = {
        low: '#28a745',
        medium: '#ffc107',
        high: '#dc3545'
    };

    return `
        <div class="milestone ${statusClass}">
            <div class="milestone-icon">${icon}</div>
            
            <div class="milestone-header">
                <h3 class="milestone-title">${milestone.title}</h3>
                <span class="milestone-status" style="background: ${priorityColors[milestone.priority] || '#6c757d'}; color: white;">
                    ${statusText}
                </span>
            </div>
            
            ${milestone.description ? `
                <p class="milestone-description">${milestone.description}</p>
            ` : ''}
            
            <div class="milestone-meta">
                <div class="milestone-meta-item">
                    <i class="bi bi-calendar-event"></i>
                    <span>Due: ${formatDate(deadline)}</span>
                </div>
                <div class="milestone-meta-item">
                    <i class="bi bi-clock"></i>
                    <span>${daysLeft >= 0 ? `${daysLeft} days left` : `${Math.abs(daysLeft)} days overdue`}</span>
                </div>
                <div class="milestone-meta-item">
                    <i class="bi bi-flag"></i>
                    <span>${milestone.priority.charAt(0).toUpperCase() + milestone.priority.slice(1)} Priority</span>
                </div>
            </div>
            
            <div class="milestone-actions">
                ${milestone.status !== 'completed' ? `
                    <button class="btn btn-success btn-sm" onclick="updateMilestoneStatus('${milestone.id}', 'completed')">
                        <i class="bi bi-check-circle"></i> Mark Complete
                    </button>
                ` : ''}
                ${milestone.status === 'pending' ? `
                    <button class="btn btn-primary btn-sm" onclick="updateMilestoneStatus('${milestone.id}', 'in-progress')">
                        <i class="bi bi-play-circle"></i> Start
                    </button>
                ` : ''}
                <button class="btn btn-danger btn-sm" onclick="deleteMilestone('${milestone.id}', '${milestone.title}')">
                    <i class="bi bi-trash"></i> Delete
                </button>
            </div>
        </div>
    `;
}

// Format date
function formatDate(date) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// Open create project modal
function openCreateProjectModal() {
    document.getElementById('createProjectModal').classList.add('show');
    document.getElementById('createProjectForm').reset();
    
    // Set min date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('projectDeadline').setAttribute('min', today);
}

// Open add milestone modal
function openAddMilestoneModal() {
    if (!currentProjectId) return;
    
    document.getElementById('addMilestoneModal').classList.add('show');
    document.getElementById('addMilestoneForm').reset();
    
    // Set min date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('milestoneDeadline').setAttribute('min', today);
}

// Close modal
function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('show');
}

// Create project form submit
document.getElementById('createProjectForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const title = document.getElementById('projectTitle').value;
    const course = document.getElementById('projectCourse').value;
    const partnerId = document.getElementById('projectPartner').value;
    const deadline = document.getElementById('projectDeadline').value;
    const description = document.getElementById('projectDescription').value;
    
    const projectData = {
        userId: userId,
        userName: userName,
        title: title,
        course: course,
        partnerId: partnerId || null,
        partnerName: null,
        deadline: deadline,
        description: description || '',
        status: 'active',
        createdAt: Date.now(),
        milestones: {}
    };
    
    // Get partner name if selected
    if (partnerId) {
        database.ref('profiles').once('value', (snapshot) => {
            const profiles = snapshot.val();
            if (profiles) {
                const profile = Object.values(profiles).find(p => emailToId(p.email) === partnerId);
                if (profile) {
                    projectData.partnerName = profile.fullName;
                }
            }
            saveProject(projectData);
        });
    } else {
        saveProject(projectData);
    }
});

// Save project
function saveProject(projectData) {
    database.ref('projects').push(projectData)
        .then(() => {
            alert('✅ Project created successfully!');
            closeModal('createProjectModal');
        })
        .catch(err => {
            alert('❌ Error: ' + err.message);
        });
}

// Add milestone form submit
document.getElementById('addMilestoneForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    if (!currentProjectId) return;
    
    const title = document.getElementById('milestoneTitle').value;
    const description = document.getElementById('milestoneDescription').value;
    const deadline = document.getElementById('milestoneDeadline').value;
    const priority = document.getElementById('milestonePriority').value;
    const status = document.getElementById('milestoneStatus').value;
    
    const milestoneData = {
        title: title,
        description: description || '',
        deadline: deadline,
        priority: priority,
        status: status,
        createdAt: Date.now()
    };
    
    database.ref('projects/' + currentProjectId + '/milestones').push(milestoneData)
        .then(() => {
            alert('✅ Milestone added successfully!');
            closeModal('addMilestoneModal');
        })
        .catch(err => {
            alert('❌ Error: ' + err.message);
        });
});

// Update milestone status
function updateMilestoneStatus(milestoneId, newStatus) {
    if (!currentProjectId) return;
    
    database.ref('projects/' + currentProjectId + '/milestones/' + milestoneId).update({
        status: newStatus,
        updatedAt: Date.now()
    })
    .then(() => {
        console.log('✅ Milestone status updated');
    })
    .catch(err => {
        alert('❌ Error: ' + err.message);
    });
}

// Delete milestone
function deleteMilestone(milestoneId, milestoneTitle) {
    if (!currentProjectId) return;
    
    if (confirm(`⚠️ Delete milestone "${milestoneTitle}"?`)) {
        database.ref('projects/' + currentProjectId + '/milestones/' + milestoneId).remove()
            .then(() => {
                alert('✅ Milestone deleted!');
            })
            .catch(err => {
                alert('❌ Error: ' + err.message);
            });
    }
}

// Delete project
function deleteProject(projectId, projectTitle) {
    if (confirm(`⚠️ Delete project "${projectTitle}" and all its milestones?`)) {
        database.ref('projects/' + projectId).remove()
            .then(() => {
                alert('✅ Project deleted!');
            })
            .catch(err => {
                alert('❌ Error: ' + err.message);
            });
    }
}

// Close modals on outside click
window.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('show');
    }
});

// Initialize
init();
console.log('✅ Project Tracker loaded!');
