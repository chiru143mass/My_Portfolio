// Profile Management JavaScript

function initProfilePage() {
    console.log('Initializing Profile Page');
    setupProfileForm();
    setupPhotoUpload();
    loadProfileData();
    loadSettings();
}

function setupProfileForm() {
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', function(e) {
            e.preventDefault();
            updateProfile();
        });
    }
}

function setupPhotoUpload() {
    const photoUpload = document.getElementById('photoUpload');
    if (photoUpload) {
        photoUpload.addEventListener('change', function(e) {
            handlePhotoUpload(e.target.files[0]);
        });
    }
}

function loadProfileData() {
    // Load current student data or use defaults
    const currentStudent = hostelData.students[0] || {
        id: 'ST001',
        name: 'John Doe',
        email: 'john.doe@email.com',
        phone: '1234567890',
        roomNumber: 'R001'
    };
    
    // Populate form fields
    document.getElementById('studentId').value = currentStudent.id;
    document.getElementById('fullName').value = currentStudent.name || '';
    document.getElementById('email').value = currentStudent.email || '';
    document.getElementById('phone').value = currentStudent.phone || '';
    document.getElementById('roomNumber').value = currentStudent.roomNumber || '';
    document.getElementById('dateOfBirth').value = currentStudent.dateOfBirth || '';
    document.getElementById('course').value = currentStudent.course || '';
    document.getElementById('emergencyContact').value = currentStudent.emergencyContact || '';
    document.getElementById('address').value = currentStudent.address || '';
    
    // Load profile photo if exists
    if (currentStudent.photo) {
        const profilePhoto = document.getElementById('profilePhoto');
        const defaultAvatar = document.getElementById('defaultAvatar');
        const removePhotoBtn = document.getElementById('removePhotoBtn');
        
        profilePhoto.src = currentStudent.photo;
        profilePhoto.style.display = 'block';
        defaultAvatar.style.display = 'none';
        removePhotoBtn.style.display = 'inline-block';
    }
}

function loadSettings() {
    // Load settings from localStorage or use defaults
    const settings = JSON.parse(localStorage.getItem('profileSettings')) || {
        emailNotifications: true,
        smsNotifications: false,
        marketingEmails: false,
        profileVisibility: true,
        contactInfoVisible: false
    };
    
    document.getElementById('emailNotifications').checked = settings.emailNotifications;
    document.getElementById('smsNotifications').checked = settings.smsNotifications;
    document.getElementById('marketingEmails').checked = settings.marketingEmails;
    document.getElementById('profileVisibility').checked = settings.profileVisibility;
    document.getElementById('contactInfoVisible').checked = settings.contactInfoVisible;
    
    // Save settings when changed
    document.querySelectorAll('#emailNotifications, #smsNotifications, #marketingEmails, #profileVisibility, #contactInfoVisible').forEach(checkbox => {
        checkbox.addEventListener('change', saveSettings);
    });
}

function saveSettings() {
    const settings = {
        emailNotifications: document.getElementById('emailNotifications').checked,
        smsNotifications: document.getElementById('smsNotifications').checked,
        marketingEmails: document.getElementById('marketingEmails').checked,
        profileVisibility: document.getElementById('profileVisibility').checked,
        contactInfoVisible: document.getElementById('contactInfoVisible').checked
    };
    
    localStorage.setItem('profileSettings', JSON.stringify(settings));
    showNotification('Settings saved successfully!', 'success');
}

function handlePhotoUpload(file) {
    if (!file) return;
    
    // Validate file
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    if (!allowedTypes.includes(file.type)) {
        showNotification('Please select a valid image file (JPG, PNG, GIF)', 'error');
        return;
    }
    
    if (file.size > maxSize) {
        showNotification('File size must be less than 5MB', 'error');
        return;
    }
    
    // Read file and display
    const reader = new FileReader();
    reader.onload = function(e) {
        const profilePhoto = document.getElementById('profilePhoto');
        const defaultAvatar = document.getElementById('defaultAvatar');
        const removePhotoBtn = document.getElementById('removePhotoBtn');
        
        profilePhoto.src = e.target.result;
        profilePhoto.style.display = 'block';
        defaultAvatar.style.display = 'none';
        removePhotoBtn.style.display = 'inline-block';
        
        // Save photo data
        const currentStudent = getCurrentStudentData();
        currentStudent.photo = e.target.result;
        saveStudentData(currentStudent);
        
        showNotification('Photo uploaded successfully!', 'success');
    };
    
    reader.readAsDataURL(file);
}

function removePhoto() {
    if (confirm('Are you sure you want to remove your profile photo?')) {
        const profilePhoto = document.getElementById('profilePhoto');
        const defaultAvatar = document.getElementById('defaultAvatar');
        const removePhotoBtn = document.getElementById('removePhotoBtn');
        
        profilePhoto.style.display = 'none';
        defaultAvatar.style.display = 'block';
        removePhotoBtn.style.display = 'none';
        
        // Remove photo data
        const currentStudent = getCurrentStudentData();
        delete currentStudent.photo;
        saveStudentData(currentStudent);
        
        showNotification('Photo removed successfully!', 'success');
    }
}

function getCurrentStudentData() {
    const studentId = document.getElementById('studentId').value;
    let student = hostelData.students.find(s => s.id === studentId);
    
    if (!student) {
        student = {
            id: studentId,
            name: '',
            email: '',
            phone: '',
            roomNumber: ''
        };
        hostelData.students.push(student);
    }
    
    return student;
}

function saveStudentData(studentData) {
    const index = hostelData.students.findIndex(s => s.id === studentData.id);
    if (index !== -1) {
        hostelData.students[index] = studentData;
    } else {
        hostelData.students.push(studentData);
    }
    saveData();
}

function updateProfile() {
    const formData = new FormData(document.getElementById('profileForm'));
    
    const profileData = {
        id: formData.get('studentId'),
        name: formData.get('fullName'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        roomNumber: formData.get('roomNumber'),
        dateOfBirth: formData.get('dateOfBirth'),
        course: formData.get('course'),
        emergencyContact: formData.get('emergencyContact'),
        address: formData.get('address')
    };
    
    // Validation
    const validationRules = {
        fullName: { required: true, label: 'Full Name', minLength: 2 },
        email: { required: true, label: 'Email', pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
        phone: { required: true, label: 'Phone Number', pattern: /^\d{10}$/ }
    };
    
    const errors = validateForm(Object.fromEntries(formData), validationRules);
    
    if (errors.length > 0) {
        showNotification(errors.join(', '), 'error');
        return;
    }
    
    // Keep existing photo if any
    const currentStudent = getCurrentStudentData();
    if (currentStudent.photo) {
        profileData.photo = currentStudent.photo;
    }
    
    // Save profile data
    saveStudentData(profileData);
    
    showNotification('Profile updated successfully!', 'success');
    sendAdminAlert(`Profile updated for student ${profileData.name} (${profileData.id})`);
    
    // Simulate email notification
    console.log(`Profile update confirmation sent to: ${profileData.email}`);
}

function downloadProfileData() {
    const currentStudent = getCurrentStudentData();
    const settings = JSON.parse(localStorage.getItem('profileSettings')) || {};
    
    const profileData = {
        personalInfo: currentStudent,
        settings: settings,
        hostelData: {
            bookings: hostelData.bookings.filter(b => b.studentId === currentStudent.id),
            complaints: hostelData.complaints.filter(c => c.studentId === currentStudent.id),
            payments: hostelData.payments.filter(p => p.studentId === currentStudent.id)
        },
        exportDate: new Date().toISOString()
    };
    
    const dataText = `
STUDENT PROFILE DATA EXPORT
Generated: ${new Date().toLocaleString()}

PERSONAL INFORMATION
====================
Student ID: ${currentStudent.id}
Name: ${currentStudent.name}
Email: ${currentStudent.email}
Phone: ${currentStudent.phone}
Room Number: ${currentStudent.roomNumber}
Date of Birth: ${currentStudent.dateOfBirth || 'Not provided'}
Course: ${currentStudent.course || 'Not provided'}
Emergency Contact: ${currentStudent.emergencyContact || 'Not provided'}
Address: ${currentStudent.address || 'Not provided'}

ACCOUNT SETTINGS
================
Email Notifications: ${settings.emailNotifications ? 'Enabled' : 'Disabled'}
SMS Notifications: ${settings.smsNotifications ? 'Enabled' : 'Disabled'}
Marketing Emails: ${settings.marketingEmails ? 'Enabled' : 'Disabled'}
Profile Visibility: ${settings.profileVisibility ? 'Public' : 'Private'}
Contact Info Visible: ${settings.contactInfoVisible ? 'Yes' : 'No'}

BOOKINGS
========
${profileData.hostelData.bookings.length > 0 ? 
    profileData.hostelData.bookings.map(b => 
        `${b.id} - ${b.roomType} - ${b.status} - ${formatDate(b.date)}`
    ).join('\n') : 
    'No bookings found'
}

COMPLAINTS
==========
${profileData.hostelData.complaints.length > 0 ? 
    profileData.hostelData.complaints.map(c => 
        `${c.id} - ${c.title} - ${c.status} - ${formatDate(c.date)}`
    ).join('\n') : 
    'No complaints found'
}

PAYMENTS
========
${profileData.hostelData.payments.length > 0 ? 
    profileData.hostelData.payments.map(p => 
        `${p.id} - ${p.type} - ₹${p.amount} - ${p.status} - ${formatDate(p.date)}`
    ).join('\n') : 
    'No payments found'
}
    `.trim();
    
    downloadData(dataText, `Profile_${currentStudent.id}_${new Date().toISOString().split('T')[0]}.txt`);
    showNotification('Profile data downloaded successfully!', 'success');
}

function resetAccount() {
    if (confirm('Are you sure you want to reset all account data? This action cannot be undone.')) {
        if (confirm('This will delete all your bookings, complaints, and payment history. Are you absolutely sure?')) {
            const studentId = document.getElementById('studentId').value;
            
            // Remove student data
            hostelData.students = hostelData.students.filter(s => s.id !== studentId);
            hostelData.bookings = hostelData.bookings.filter(b => b.studentId !== studentId);
            hostelData.complaints = hostelData.complaints.filter(c => c.studentId !== studentId);
            hostelData.payments = hostelData.payments.filter(p => p.studentId !== studentId);
            
            // Clear settings
            localStorage.removeItem('profileSettings');
            
            // Save changes
            saveData();
            
            // Reset form
            document.getElementById('profileForm').reset();
            document.getElementById('studentId').value = studentId;
            
            // Reset photo
            const profilePhoto = document.getElementById('profilePhoto');
            const defaultAvatar = document.getElementById('defaultAvatar');
            const removePhotoBtn = document.getElementById('removePhotoBtn');
            
            profilePhoto.style.display = 'none';
            defaultAvatar.style.display = 'block';
            removePhotoBtn.style.display = 'none';
            
            // Reset settings
            loadSettings();
            
            showNotification('Account data has been reset successfully!', 'success');
            sendAdminAlert(`Account reset performed for student ID: ${studentId}`);
        }
    }
}

// Initialize on page load
if (getCurrentPage() === 'profile') {
    document.addEventListener('DOMContentLoaded', initProfilePage);
}