// Global Variables
let hostelData = {
    rooms: [
        { id: 'R001', floor: 1, capacity: 2, status: 'available', type: 'Standard', price: 5000 },
        { id: 'R002', floor: 1, capacity: 2, status: 'occupied', type: 'Standard', price: 5000, student: 'John Doe' },
        { id: 'R003', floor: 1, capacity: 1, status: 'available', type: 'Single', price: 7000 },
        { id: 'R004', floor: 1, capacity: 4, status: 'maintenance', type: 'Dormitory', price: 3000 },
        { id: 'R005', floor: 2, capacity: 2, status: 'occupied', type: 'Deluxe', price: 8000, student: 'Jane Smith' },
        { id: 'R006', floor: 2, capacity: 1, status: 'available', type: 'Single', price: 7000 },
        { id: 'R007', floor: 2, capacity: 2, status: 'available', type: 'Standard', price: 5000 },
        { id: 'R008', floor: 3, capacity: 4, status: 'occupied', type: 'Dormitory', price: 3000, student: 'Mike Johnson' },
        { id: 'R009', floor: 3, capacity: 2, status: 'available', type: 'Deluxe', price: 8000 },
        { id: 'R010', floor: 3, capacity: 1, status: 'maintenance', type: 'Single', price: 7000 }
    ],
    bookings: [
        { id: 'B001', name: 'Alice Brown', studentId: 'ST001', gender: 'Female', roomType: 'Single', status: 'Pending', date: '2024-01-15' },
        { id: 'B002', name: 'Bob Wilson', studentId: 'ST002', gender: 'Male', roomType: 'Standard', status: 'Approved', date: '2024-01-10' }
    ],
    complaints: [
        { id: 'C001', title: 'Water Issue', description: 'No hot water in room R002', urgency: 'High', status: 'Open', date: '2024-01-20', studentId: 'ST002' },
        { id: 'C002', title: 'Noise Problem', description: 'Loud music from neighboring room', urgency: 'Medium', status: 'Resolved', date: '2024-01-18', studentId: 'ST001' }
    ],
    payments: [
        { id: 'P001', studentId: 'ST001', roomNumber: 'R003', amount: 7000, date: '2024-01-01', status: 'Paid', type: 'Monthly Rent' },
        { id: 'P002', studentId: 'ST002', roomNumber: 'R002', amount: 5000, date: '2024-01-01', status: 'Paid', type: 'Monthly Rent' },
        { id: 'P003', studentId: 'ST003', roomNumber: 'R005', amount: 8000, date: '2024-01-01', status: 'Pending', type: 'Monthly Rent' }
    ],
    students: [
        { id: 'ST001', name: 'Alice Brown', email: 'alice@email.com', phone: '1234567890', roomNumber: 'R003', photo: '' },
        { id: 'ST002', name: 'Bob Wilson', email: 'bob@email.com', phone: '0987654321', roomNumber: 'R002', photo: '' },
        { id: 'ST003', name: 'Charlie Davis', email: 'charlie@email.com', phone: '5555555555', roomNumber: 'R005', photo: '' }
    ]
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Mobile navigation toggle
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }

    // Close mobile menu when clicking on a link
    document.querySelectorAll('.nav-link').forEach(n => n.addEventListener('click', () => {
        if (hamburger && navMenu) {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        }
    }));

    // Initialize page-specific functionality
    const currentPage = getCurrentPage();
    switch(currentPage) {
        case 'index':
            initHomePage();
            break;
        case 'rooms':
            if (typeof initRoomsPage === 'function') initRoomsPage();
            break;
        case 'booking':
            if (typeof initBookingPage === 'function') initBookingPage();
            break;
        case 'complaints':
            if (typeof initComplaintsPage === 'function') initComplaintsPage();
            break;
        case 'payment':
            if (typeof initPaymentPage === 'function') initPaymentPage();
            break;
        case 'profile':
            if (typeof initProfilePage === 'function') initProfilePage();
            break;
        case 'admin':
            if (typeof initAdminPage === 'function') initAdminPage();
            break;
        case 'contact':
            if (typeof initContactPage === 'function') initContactPage();
            break;
    }

    // Initialize common features
    initScrollAnimations();
    initModals();
}

function getCurrentPage() {
    const path = window.location.pathname;
    const page = path.split('/').pop().split('.')[0];
    return page || 'index';
}

// Home Page Functions
function initHomePage() {
    // Animate counter numbers
    animateCounters();
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

function animateCounters() {
    const counters = document.querySelectorAll('.stat-number');
    const observerOptions = {
        threshold: 0.7
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    counters.forEach(counter => observer.observe(counter));
}

function animateCounter(element) {
    const target = parseInt(element.getAttribute('data-target'));
    const duration = 2000;
    const step = target / (duration / 16);
    let current = 0;

    const timer = setInterval(() => {
        current += step;
        if (current >= target) {
            element.textContent = target;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current);
        }
    }, 16);
}

// Scroll Animations
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.feature-card, .gallery-item, .stat-item');
    
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// Modal Functions
function initModals() {
    // Close modal when clicking outside
    window.onclick = function(event) {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    };

    // Close modal with close button
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.onclick = function() {
            this.closest('.modal').style.display = 'none';
        };
    });
}

function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
    }
}

function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

// Notification System
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    
    // Add notification styles
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#4CAF50' : '#f44336'};
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        z-index: 9999;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        gap: 10px;
        max-width: 300px;
    `;
    
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Hide notification after 4 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 4000);
}

// Simulate Admin Alert
function sendAdminAlert(message, type = 'info') {
    console.log(`Admin Alert [${type.toUpperCase()}]: ${message}`);
    showNotification(`Admin notified: ${message}`, 'success');
}

// Data Management Functions
function generateId(prefix) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `${prefix}${timestamp}${random}`.toUpperCase();
}

function saveData() {
    try {
        localStorage.setItem('hostelData', JSON.stringify(hostelData));
        return true;
    } catch (error) {
        console.error('Error saving data:', error);
        return false;
    }
}

function loadData() {
    try {
        const saved = localStorage.getItem('hostelData');
        if (saved) {
            hostelData = { ...hostelData, ...JSON.parse(saved) };
        }
        return true;
    } catch (error) {
        console.error('Error loading data:', error);
        return false;
    }
}

// Form Validation
function validateForm(formData, rules) {
    const errors = [];
    
    for (const [field, rule] of Object.entries(rules)) {
        const value = formData[field];
        
        if (rule.required && (!value || value.trim() === '')) {
            errors.push(`${rule.label} is required`);
            continue;
        }
        
        if (value && rule.minLength && value.length < rule.minLength) {
            errors.push(`${rule.label} must be at least ${rule.minLength} characters`);
        }
        
        if (value && rule.pattern && !rule.pattern.test(value)) {
            errors.push(`${rule.label} format is invalid`);
        }
    }
    
    return errors;
}

// Export data as text file
function downloadData(data, filename) {
    const content = JSON.stringify(data, null, 2);
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

// Date formatting
function formatDate(date) {
    if (!date) return '-';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Load saved data on initialization
loadData();