// Booking Management JavaScript

function initBookingPage() {
    console.log('Initializing Booking Page');
    setupBookingForm();
    displayAvailableRooms();
    displayBookings();
    setMinDate();
}

function setMinDate() {
    const moveInDate = document.getElementById('moveInDate');
    if (moveInDate) {
        const today = new Date();
        const minDate = today.toISOString().split('T')[0];
        moveInDate.setAttribute('min', minDate);
    }
}

function setupBookingForm() {
    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
        bookingForm.addEventListener('submit', function(e) {
            e.preventDefault();
            submitBooking();
        });
    }
}

function updateRoomPrice() {
    const roomTypeSelect = document.getElementById('roomType');
    const priceDisplay = document.getElementById('priceDisplay');
    const selectedPrice = document.getElementById('selectedPrice');
    
    if (roomTypeSelect.value) {
        const selectedOption = roomTypeSelect.options[roomTypeSelect.selectedIndex];
        const price = selectedOption.getAttribute('data-price');
        selectedPrice.textContent = `₹${parseInt(price).toLocaleString()}`;
        priceDisplay.style.display = 'block';
    } else {
        priceDisplay.style.display = 'none';
    }
}

function displayAvailableRooms() {
    const availableRoomsContainer = document.getElementById('availableRooms');
    if (!availableRoomsContainer) return;
    
    const availableRooms = hostelData.rooms.filter(room => room.status === 'available');
    
    if (availableRooms.length === 0) {
        availableRoomsContainer.innerHTML = '<p style="text-align: center; color: #666;">No rooms currently available</p>';
        return;
    }
    
    const roomsByType = {};
    availableRooms.forEach(room => {
        if (!roomsByType[room.type]) {
            roomsByType[room.type] = [];
        }
        roomsByType[room.type].push(room);
    });
    
    let html = '';
    for (const [type, rooms] of Object.entries(roomsByType)) {
        html += `
            <div style="margin-bottom: 1.5rem; padding: 1rem; border: 1px solid #ddd; border-radius: 8px;">
                <h4 style="margin-bottom: 0.5rem; color: #667eea;">${type} Rooms</h4>
                <p style="color: #666; margin-bottom: 1rem;">₹${rooms[0].price.toLocaleString()}/month • ${rooms[0].capacity} person${rooms[0].capacity > 1 ? 's' : ''}</p>
                <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
        `;
        
        rooms.forEach(room => {
            html += `
                <span style="background: #e8f4fd; color: #1976d2; padding: 4px 8px; border-radius: 4px; font-size: 0.9rem;">
                    ${room.id} (Floor ${room.floor})
                </span>
            `;
        });
        
        html += `
                </div>
                <p style="margin-top: 0.5rem; font-size: 0.9rem; color: #666;">
                    <strong>${rooms.length}</strong> room${rooms.length > 1 ? 's' : ''} available
                </p>
            </div>
        `;
    }
    
    availableRoomsContainer.innerHTML = html;
}

function displayBookings() {
    const tableBody = document.getElementById('bookingsTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    if (hostelData.bookings.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: #666;">No bookings found</td></tr>';
        return;
    }
    
    hostelData.bookings.forEach((booking, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${booking.id}</td>
            <td>${booking.name}</td>
            <td>${booking.studentId}</td>
            <td>${booking.roomType}</td>
            <td><span class="status ${booking.status.toLowerCase()}">${booking.status}</span></td>
            <td>${formatDate(booking.date)}</td>
            <td>
                ${booking.status === 'Pending' ? 
                    `<button class="btn btn-sm" onclick="cancelBooking(${index})" style="background: #f44336; color: white;">
                        <i class="fas fa-times"></i> Cancel
                    </button>` : 
                    '<span style="color: #666;">-</span>'
                }
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function submitBooking() {
    const formData = new FormData(document.getElementById('bookingForm'));
    
    const bookingData = {
        id: generateId('B'),
        name: formData.get('studentName'),
        studentId: formData.get('studentId'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        gender: formData.get('gender'),
        roomType: formData.get('roomType'),
        moveInDate: formData.get('moveInDate'),
        emergencyContact: formData.get('emergencyContact'),
        specialRequests: formData.get('specialRequests'),
        status: 'Pending',
        date: new Date().toISOString().split('T')[0]
    };
    
    // Validation
    const validationRules = {
        studentName: { required: true, label: 'Full Name', minLength: 2 },
        studentId: { required: true, label: 'Student ID', minLength: 3 },
        email: { required: true, label: 'Email', pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
        phone: { required: true, label: 'Phone Number', pattern: /^\d{10}$/ },
        gender: { required: true, label: 'Gender' },
        roomType: { required: true, label: 'Room Type' },
        moveInDate: { required: true, label: 'Move-in Date' },
        emergencyContact: { required: true, label: 'Emergency Contact', pattern: /^\d{10}$/ }
    };
    
    const errors = validateForm(Object.fromEntries(formData), validationRules);
    
    if (errors.length > 0) {
        showNotification(errors.join(', '), 'error');
        return;
    }
    
    // Check if student already has a pending or approved booking
    const existingBooking = hostelData.bookings.find(booking => 
        booking.studentId === bookingData.studentId && 
        (booking.status === 'Pending' || booking.status === 'Approved')
    );
    
    if (existingBooking) {
        showNotification('You already have an active booking application!', 'error');
        return;
    }
    
    // Check if there are available rooms of the requested type
    const availableRooms = hostelData.rooms.filter(room => 
        room.status === 'available' && room.type === bookingData.roomType
    );
    
    if (availableRooms.length === 0) {
        showNotification(`No ${bookingData.roomType} rooms are currently available!`, 'error');
        return;
    }
    
    // Add booking to data
    hostelData.bookings.push(bookingData);
    saveData();
    
    // Show confirmation modal
    showBookingConfirmation(bookingData);
    
    // Reset form and update displays
    document.getElementById('bookingForm').reset();
    document.getElementById('priceDisplay').style.display = 'none';
    displayBookings();
    
    // Send notifications
    showNotification('Booking application submitted successfully!');
    sendAdminAlert(`New booking application received from ${bookingData.name} (${bookingData.studentId})`);
    sendUserNotification(bookingData.email, 'Booking Application Received', 
        `Your hostel booking application has been submitted and is under review.`);
}

function showBookingConfirmation(bookingData) {
    const confirmationDetails = document.getElementById('confirmationDetails');
    const roomTypeOption = document.querySelector(`#roomType option[value="${bookingData.roomType}"]`);
    const monthlyRent = roomTypeOption ? roomTypeOption.getAttribute('data-price') : 'N/A';
    
    confirmationDetails.innerHTML = `
        <p><strong>Booking ID:</strong> ${bookingData.id}</p>
        <p><strong>Name:</strong> ${bookingData.name}</p>
        <p><strong>Student ID:</strong> ${bookingData.studentId}</p>
        <p><strong>Room Type:</strong> ${bookingData.roomType}</p>
        <p><strong>Monthly Rent:</strong> ₹${parseInt(monthlyRent).toLocaleString()}</p>
        <p><strong>Preferred Move-in:</strong> ${formatDate(bookingData.moveInDate)}</p>
        <p><strong>Application Date:</strong> ${formatDate(bookingData.date)}</p>
    `;
    
    showModal('confirmationModal');
}

function cancelBooking(index) {
    const booking = hostelData.bookings[index];
    
    if (confirm(`Are you sure you want to cancel booking ${booking.id}?`)) {
        hostelData.bookings.splice(index, 1);
        saveData();
        displayBookings();
        
        showNotification('Booking cancelled successfully!');
        sendAdminAlert(`Booking ${booking.id} has been cancelled by ${booking.name}`);
    }
}

function sendUserNotification(email, subject, message) {
    // Simulate sending email notification
    console.log(`Email sent to ${email}:`);
    console.log(`Subject: ${subject}`);
    console.log(`Message: ${message}`);
    
    // In a real application, this would integrate with an email service
}

// Initialize on page load
if (getCurrentPage() === 'booking') {
    document.addEventListener('DOMContentLoaded', initBookingPage);
}