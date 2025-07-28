// Complaints Management JavaScript

function initComplaintsPage() {
    console.log('Initializing Complaints Page');
    setupComplaintForm();
    displayComplaints();
}

function setupComplaintForm() {
    const complaintForm = document.getElementById('complaintForm');
    if (complaintForm) {
        complaintForm.addEventListener('submit', function(e) {
            e.preventDefault();
            submitComplaint();
        });
    }
}

function displayComplaints() {
    const tableBody = document.getElementById('complaintsTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    if (hostelData.complaints.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: #666;">No complaints found</td></tr>';
        return;
    }
    
    hostelData.complaints.forEach((complaint, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${complaint.id}</td>
            <td>${complaint.title}</td>
            <td>${complaint.category || 'General'}</td>
            <td><span class="urgency-badge ${complaint.urgency.toLowerCase()}">${complaint.urgency}</span></td>
            <td><span class="status ${complaint.status.toLowerCase()}">${complaint.status}</span></td>
            <td>${formatDate(complaint.date)}</td>
            <td>
                <button class="btn btn-sm" onclick="viewComplaint(${index})" style="background: #667eea; color: white; margin-right: 5px;">
                    <i class="fas fa-eye"></i>
                </button>
                ${complaint.status === 'Open' ? 
                    `<button class="btn btn-sm" onclick="withdrawComplaint(${index})" style="background: #f44336; color: white;">
                        <i class="fas fa-times"></i>
                    </button>` : 
                    ''
                }
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function submitComplaint() {
    const formData = new FormData(document.getElementById('complaintForm'));
    
    const complaintData = {
        id: generateId('C'),
        studentId: formData.get('studentId'),
        studentName: formData.get('studentName'),
        roomNumber: formData.get('roomNumber') || 'N/A',
        title: formData.get('complaintTitle'),
        category: formData.get('complaintCategory'),
        urgency: formData.get('urgencyLevel'),
        description: formData.get('complaintDescription'),
        preferredSolution: formData.get('preferredSolution') || '',
        status: 'Open',
        date: new Date().toISOString().split('T')[0],
        dateTime: new Date().toISOString()
    };
    
    // Validation
    const validationRules = {
        studentId: { required: true, label: 'Student ID', minLength: 3 },
        studentName: { required: true, label: 'Student Name', minLength: 2 },
        complaintTitle: { required: true, label: 'Complaint Title', minLength: 5 },
        complaintCategory: { required: true, label: 'Category' },
        urgencyLevel: { required: true, label: 'Urgency Level' },
        complaintDescription: { required: true, label: 'Description', minLength: 10 }
    };
    
    const errors = validateForm(Object.fromEntries(formData), validationRules);
    
    if (errors.length > 0) {
        showNotification(errors.join(', '), 'error');
        return;
    }
    
    // Add complaint to data
    hostelData.complaints.push(complaintData);
    saveData();
    
    // Show confirmation modal
    showComplaintConfirmation(complaintData);
    
    // Reset form and update display
    document.getElementById('complaintForm').reset();
    displayComplaints();
    
    // Send notifications
    showNotification('Complaint submitted successfully!');
    sendAdminAlert(`New ${complaintData.urgency.toLowerCase()} priority complaint received: ${complaintData.title}`);
    sendComplaintNotifications(complaintData);
}

function showComplaintConfirmation(complaintData) {
    const confirmationDetails = document.getElementById('complaintConfirmationDetails');
    
    const responseTime = getResponseTime(complaintData.urgency);
    
    confirmationDetails.innerHTML = `
        <p><strong>Complaint ID:</strong> ${complaintData.id}</p>
        <p><strong>Title:</strong> ${complaintData.title}</p>
        <p><strong>Category:</strong> ${complaintData.category}</p>
        <p><strong>Urgency Level:</strong> ${complaintData.urgency}</p>
        <p><strong>Expected Response:</strong> ${responseTime}</p>
        <p><strong>Submitted:</strong> ${formatDate(complaintData.date)}</p>
    `;
    
    showModal('complaintConfirmationModal');
}

function getResponseTime(urgency) {
    const responseTimes = {
        'Critical': 'Within 1 hour',
        'High': 'Within 4 hours',
        'Medium': 'Within 24 hours',
        'Low': 'Within 3 days'
    };
    return responseTimes[urgency] || 'Within 24 hours';
}

function sendComplaintNotifications(complaintData) {
    // Simulate different notification types based on urgency
    if (complaintData.urgency === 'Critical' || complaintData.urgency === 'High') {
        // Simulate immediate alert to admin and maintenance
        console.log('URGENT ALERT sent to Admin and Maintenance Team');
        console.log('SMS alert sent to Facility Manager');
        showNotification('Emergency team has been notified immediately!', 'success');
    }
    
    // Simulate email notifications
    console.log(`Email notification sent to student: ${complaintData.studentId}`);
    console.log(`Ticket created in helpdesk system: ${complaintData.id}`);
    
    // Auto-assign based on category
    const assignmentRules = {
        'Maintenance': 'Maintenance Team',
        'Cleanliness': 'Housekeeping Staff',
        'Security': 'Security Department',
        'Food': 'Food Service Manager',
        'Noise': 'Resident Advisor',
        'Staff': 'HR Department',
        'Facilities': 'Facility Management'
    };
    
    const assignedTo = assignmentRules[complaintData.category] || 'General Administration';
    console.log(`Complaint automatically assigned to: ${assignedTo}`);
}

function viewComplaint(index) {
    const complaint = hostelData.complaints[index];
    const complaintDetails = document.getElementById('complaintDetails');
    
    const urgencyColor = {
        'Critical': '#d32f2f',
        'High': '#f57c00',
        'Medium': '#1976d2',
        'Low': '#388e3c'
    };
    
    complaintDetails.innerHTML = `
        <div style="margin-bottom: 1rem;">
            <h3>${complaint.title}</h3>
            <div style="display: flex; gap: 1rem; margin: 1rem 0; flex-wrap: wrap;">
                <span style="background: #e3f2fd; color: #1976d2; padding: 4px 8px; border-radius: 4px; font-size: 0.9rem;">
                    <i class="fas fa-tag"></i> ${complaint.category}
                </span>
                <span style="background: ${urgencyColor[complaint.urgency]}; color: white; padding: 4px 8px; border-radius: 4px; font-size: 0.9rem;">
                    <i class="fas fa-exclamation-triangle"></i> ${complaint.urgency} Priority
                </span>
                <span style="background: ${complaint.status === 'Open' ? '#fff3cd' : '#d4edda'}; color: ${complaint.status === 'Open' ? '#856404' : '#155724'}; padding: 4px 8px; border-radius: 4px; font-size: 0.9rem;">
                    <i class="fas fa-circle"></i> ${complaint.status}
                </span>
            </div>
        </div>
        
        <div style="background: #f8f9fa; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
            <p><strong>Student ID:</strong> ${complaint.studentId}</p>
            <p><strong>Student Name:</strong> ${complaint.studentName}</p>
            <p><strong>Room Number:</strong> ${complaint.roomNumber}</p>
            <p><strong>Date Submitted:</strong> ${formatDate(complaint.date)}</p>
        </div>
        
        <div style="margin-bottom: 1rem;">
            <h4>Description:</h4>
            <p style="background: white; padding: 1rem; border-radius: 8px; border: 1px solid #ddd; margin-top: 0.5rem; line-height: 1.6;">
                ${complaint.description}
            </p>
        </div>
        
        ${complaint.preferredSolution ? `
            <div style="margin-bottom: 1rem;">
                <h4>Preferred Solution:</h4>
                <p style="background: #f0f8ff; padding: 1rem; border-radius: 8px; border: 1px solid #cce7ff; margin-top: 0.5rem; line-height: 1.6;">
                    ${complaint.preferredSolution}
                </p>
            </div>
        ` : ''}
        
        <div style="margin-bottom: 1rem;">
            <h4>Expected Response Time:</h4>
            <p style="color: #667eea; font-weight: bold;">${getResponseTime(complaint.urgency)}</p>
        </div>
    `;
    
    showModal('viewComplaintModal');
}

function withdrawComplaint(index) {
    const complaint = hostelData.complaints[index];
    
    if (confirm(`Are you sure you want to withdraw complaint "${complaint.title}"?`)) {
        hostelData.complaints.splice(index, 1);
        saveData();
        displayComplaints();
        
        showNotification('Complaint withdrawn successfully!');
        sendAdminAlert(`Complaint ${complaint.id} has been withdrawn by ${complaint.studentName}`);
    }
}

// Add CSS for urgency badges
function addUrgencyStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .urgency-badge {
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 0.8rem;
            font-weight: bold;
            text-transform: uppercase;
        }
        .urgency-badge.critical {
            background: #ffebee;
            color: #d32f2f;
        }
        .urgency-badge.high {
            background: #fff3e0;
            color: #f57c00;
        }
        .urgency-badge.medium {
            background: #e3f2fd;
            color: #1976d2;
        }
        .urgency-badge.low {
            background: #e8f5e8;
            color: #388e3c;
        }
        .status.open {
            background: #fff3cd;
            color: #856404;
        }
        .status.resolved {
            background: #d4edda;
            color: #155724;
        }
        .status.in-progress {
            background: #cce7ff;
            color: #0066cc;
        }
    `;
    document.head.appendChild(style);
}

// Initialize on page load
if (getCurrentPage() === 'complaints') {
    document.addEventListener('DOMContentLoaded', function() {
        addUrgencyStyles();
        initComplaintsPage();
    });
}