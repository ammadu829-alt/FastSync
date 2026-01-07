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

let allReports = [];
let filteredReports = [];

// Initialize
function init() {
    loadReports();
    setupEventListeners();
}

// Load all reports
function loadReports() {
    const container = document.getElementById('reportsContainer');
    container.innerHTML = '<div class="loading">Loading reports...</div>';
    
    database.ref('reports').on('value', (snapshot) => {
        const data = snapshot.val();
        
        if (!data) {
            allReports = [];
            showNoReports();
            updateStats();
            return;
        }
        
        // Convert to array with IDs
        allReports = Object.entries(data).map(([id, report]) => ({
            ...report,
            id
        }));
        
        // Sort by timestamp (newest first)
        allReports.sort((a, b) => b.timestamp - a.timestamp);
        
        updateStats();
        applyFilters();
    });
}

// Update statistics
function updateStats() {
    const pending = allReports.filter(r => r.status === 'pending').length;
    const reviewed = allReports.filter(r => r.status === 'reviewed').length;
    const total = allReports.length;
    
    document.getElementById('pendingCount').textContent = pending;
    document.getElementById('reviewedCount').textContent = reviewed;
    document.getElementById('totalCount').textContent = total;
}

// Apply filters
function applyFilters() {
    const statusFilter = document.getElementById('statusFilter').value;
    const reasonFilter = document.getElementById('reasonFilter').value;
    
    filteredReports = allReports.filter(report => {
        if (statusFilter && report.status !== statusFilter) return false;
        if (reasonFilter && report.reportReason !== reasonFilter) return false;
        return true;
    });
    
    displayReports();
}

// Display reports
function displayReports() {
    const container = document.getElementById('reportsContainer');
    const noReports = document.getElementById('noReports');
    
    if (filteredReports.length === 0) {
        container.innerHTML = '';
        noReports.style.display = 'block';
        return;
    }
    
    noReports.style.display = 'none';
    
    container.innerHTML = filteredReports.map(report => `
        <div class="report-card ${report.status || 'pending'}">
            <div class="report-header">
                <div class="report-user">
                    <h3>🚨 ${report.reportedUserName}</h3>
                    <p>${report.reportedUserRoll || 'Roll number not provided'}</p>
                </div>
                <span class="status-badge ${report.status || 'pending'}">
                    ${report.status || 'pending'}
                </span>
            </div>
            
            <div class="report-info">
                <div class="info-item">
                    <strong>Reason</strong>
                    <p><span class="reason-badge">${report.reportReason}</span></p>
                </div>
                <div class="info-item">
                    <strong>Reported By</strong>
                    <p>${report.reporterName}</p>
                </div>
                <div class="info-item">
                    <strong>Date</strong>
                    <p>${formatDate(report.timestamp)}</p>
                </div>
            </div>
            
            <div class="report-description">
                <strong>Description</strong>
                <p>${report.reportDescription}</p>
            </div>
            
            <div class="report-actions">
                <button class="btn btn-view" onclick="viewReport('${report.id}')">
                    👁️ View Full Details
                </button>
                ${report.status !== 'reviewed' ? `
                    <button class="btn btn-mark-reviewed" onclick="markAsReviewed('${report.id}')">
                        ✅ Mark as Reviewed
                    </button>
                ` : ''}
                <button class="btn btn-delete" onclick="deleteReport('${report.id}')">
                    🗑️ Delete Report
                </button>
            </div>
        </div>
    `).join('');
}

// View full report details
window.viewReport = function(reportId) {
    const report = allReports.find(r => r.id === reportId);
    if (!report) return;
    
    const modal = document.getElementById('detailModal');
    const content = document.getElementById('reportDetailContent');
    
    content.innerHTML = `
        <div class="detail-section">
            <h3>📋 Reported User Information</h3>
            <div class="detail-grid">
                <div class="detail-item">
                    <strong>Name</strong>
                    <p>${report.reportedUserName}</p>
                </div>
                <div class="detail-item">
                    <strong>Roll Number</strong>
                    <p>${report.reportedUserRoll || 'Not provided'}</p>
                </div>
                <div class="detail-item">
                    <strong>Reason</strong>
                    <p><span class="reason-badge">${report.reportReason}</span></p>
                </div>
                <div class="detail-item">
                    <strong>Status</strong>
                    <p><span class="status-badge ${report.status || 'pending'}">${report.status || 'pending'}</span></p>
                </div>
            </div>
        </div>
        
        <div class="detail-section">
            <h3>👤 Reporter Information</h3>
            <div class="detail-grid">
                <div class="detail-item">
                    <strong>Name</strong>
                    <p>${report.reporterName}</p>
                </div>
                <div class="detail-item">
                    <strong>Email</strong>
                    <p>${report.reporterEmail}</p>
                </div>
                <div class="detail-item">
                    <strong>Roll Number</strong>
                    <p>${report.reporterRollNumber}</p>
                </div>
                <div class="detail-item">
                    <strong>University</strong>
                    <p>${report.reporterUniversity}</p>
                </div>
                <div class="detail-item">
                    <strong>Department</strong>
                    <p>${report.reporterDepartment}</p>
                </div>
                <div class="detail-item">
                    <strong>Section</strong>
                    <p>Section ${report.reporterSection}</p>
                </div>
                <div class="detail-item">
                    <strong>Semester</strong>
                    <p>${report.reporterSemester}${getOrdinalSuffix(report.reporterSemester)} Semester</p>
                </div>
                <div class="detail-item">
                    <strong>Report Date</strong>
                    <p>${formatDate(report.timestamp)}</p>
                </div>
            </div>
        </div>
        
        <div class="detail-section">
            <h3>📝 Full Description</h3>
            <p style="color: #b0b0b0; line-height: 1.8;">${report.reportDescription}</p>
        </div>
        
        <div class="report-actions">
            ${report.status !== 'reviewed' ? `
                <button class="btn btn-mark-reviewed" onclick="markAsReviewed('${report.id}'); document.getElementById('detailModal').style.display='none';">
                    ✅ Mark as Reviewed
                </button>
            ` : ''}
            <button class="btn btn-delete" onclick="deleteReport('${report.id}'); document.getElementById('detailModal').style.display='none';">
                🗑️ Delete Report
            </button>
        </div>
    `;
    
    modal.style.display = 'flex';
};

// Mark report as reviewed
window.markAsReviewed = function(reportId) {
    if (confirm('Mark this report as reviewed?')) {
        database.ref('reports/' + reportId).update({
            status: 'reviewed',
            reviewedAt: Date.now()
        }).then(() => {
            alert('✅ Report marked as reviewed!');
        }).catch(err => {
            alert('❌ Error: ' + err.message);
        });
    }
};

// Delete report
window.deleteReport = function(reportId) {
    if (confirm('⚠️ Are you sure you want to delete this report? This action cannot be undone!')) {
        database.ref('reports/' + reportId).remove()
            .then(() => {
                alert('✅ Report deleted successfully!');
            })
            .catch(err => {
                alert('❌ Error: ' + err.message);
            });
    }
};

// Format date
function formatDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Get ordinal suffix
function getOrdinalSuffix(num) {
    const suffixes = ['th', 'st', 'nd', 'rd'];
    const v = num % 100;
    return suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0];
}

// Show no reports message
function showNoReports() {
    const container = document.getElementById('reportsContainer');
    const noReports = document.getElementById('noReports');
    container.innerHTML = '';
    noReports.style.display = 'block';
}

// Setup event listeners
function setupEventListeners() {
    // Filters
    document.getElementById('statusFilter').addEventListener('change', applyFilters);
    document.getElementById('reasonFilter').addEventListener('change', applyFilters);
    
    // Refresh button
    document.getElementById('refreshBtn').addEventListener('click', () => {
        loadReports();
        alert('🔄 Reports refreshed!');
    });
    
    // Close modal
    document.getElementById('closeDetailModal').addEventListener('click', () => {
        document.getElementById('detailModal').style.display = 'none';
    });
    
    // Click outside modal to close
    window.addEventListener('click', (e) => {
        const modal = document.getElementById('detailModal');
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', init);
console.log('✅ Admin Reports Dashboard loaded successfully!');
