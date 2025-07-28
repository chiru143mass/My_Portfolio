// Admin Dashboard JavaScript

function initAdminPage() {
    console.log('Initializing Admin Dashboard');
    updateStatistics();
    displayRecentActivities();
    displayRoomOverview();
    displayPaymentOverview();
}

function updateStatistics() {
    // Calculate statistics
    const totalRooms = hostelData.rooms.length;
    const occupiedRooms = hostelData.rooms.filter(room => room.status === 'occupied').length;
    const activeComplaints = hostelData.complaints.filter(complaint => complaint.status === 'Open').length;
    
    // Calculate monthly revenue (current month paid payments)
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlyRevenue = hostelData.payments
        .filter(payment => {
            const paymentDate = new Date(payment.date);
            return payment.status === 'Paid' && 
                   paymentDate.getMonth() === currentMonth && 
                   paymentDate.getFullYear() === currentYear;
        })
        .reduce((total, payment) => total + payment.amount, 0);

    // Update DOM elements
    document.getElementById('totalRooms').textContent = totalRooms;
    document.getElementById('occupiedRooms').textContent = occupiedRooms;
    document.getElementById('activeComplaints').textContent = activeComplaints;
    document.getElementById('monthlyRevenue').textContent = `₹${monthlyRevenue.toLocaleString()}`;

    // Animate counters
    animateCounter(document.getElementById('totalRooms'), totalRooms);
    animateCounter(document.getElementById('occupiedRooms'), occupiedRooms);
    animateCounter(document.getElementById('activeComplaints'), activeComplaints);
}

function animateCounter(element, target) {
    const duration = 1000;
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

function displayRecentActivities() {
    displayRecentBookings();
    displayRecentComplaints();
}

function displayRecentBookings() {
    const recentBookingsContainer = document.getElementById('recentBookings');
    const recentBookings = hostelData.bookings
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);

    if (recentBookings.length === 0) {
        recentBookingsContainer.innerHTML = '<p style="text-align: center; color: #666; padding: 2rem;">No recent bookings</p>';
        return;
    }

    let html = '';
    recentBookings.forEach(booking => {
        html += `
            <div style="background: #f8f9fa; padding: 1rem; border-radius: 8px; margin-bottom: 1rem; border-left: 4px solid #667eea;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                    <strong>${booking.name}</strong>
                    <span class="status ${booking.status.toLowerCase()}">${booking.status}</span>
                </div>
                <p style="color: #666; margin-bottom: 0.5rem;">${booking.studentId} • ${booking.roomType}</p>
                <p style="color: #888; font-size: 0.9rem;">${formatDate(booking.date)}</p>
            </div>
        `;
    });

    recentBookingsContainer.innerHTML = html;
}

function displayRecentComplaints() {
    const recentComplaintsContainer = document.getElementById('recentComplaints');
    const recentComplaints = hostelData.complaints
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);

    if (recentComplaints.length === 0) {
        recentComplaintsContainer.innerHTML = '<p style="text-align: center; color: #666; padding: 2rem;">No recent complaints</p>';
        return;
    }

    let html = '';
    recentComplaints.forEach(complaint => {
        const urgencyColor = {
            'Critical': '#d32f2f',
            'High': '#f57c00',
            'Medium': '#1976d2',
            'Low': '#388e3c'
        };

        html += `
            <div style="background: #f8f9fa; padding: 1rem; border-radius: 8px; margin-bottom: 1rem; border-left: 4px solid ${urgencyColor[complaint.urgency]};">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                    <strong>${complaint.title}</strong>
                    <span style="background: ${urgencyColor[complaint.urgency]}; color: white; padding: 2px 6px; border-radius: 4px; font-size: 0.8rem;">
                        ${complaint.urgency}
                    </span>
                </div>
                <p style="color: #666; margin-bottom: 0.5rem;">${complaint.studentName} • ${complaint.category || 'General'}</p>
                <p style="color: #888; font-size: 0.9rem;">${formatDate(complaint.date)}</p>
            </div>
        `;
    });

    recentComplaintsContainer.innerHTML = html;
}

function displayRoomOverview() {
    displayRoomsByFloor();
    displayRoomsByType();
    displayRoomsByStatus();
}

function displayRoomsByFloor() {
    const roomsByFloor = {};
    hostelData.rooms.forEach(room => {
        if (!roomsByFloor[room.floor]) {
            roomsByFloor[room.floor] = { total: 0, occupied: 0, available: 0, maintenance: 0 };
        }
        roomsByFloor[room.floor].total++;
        roomsByFloor[room.floor][room.status]++;
    });

    let html = '';
    for (const [floor, stats] of Object.entries(roomsByFloor)) {
        const occupancyRate = Math.round((stats.occupied / stats.total) * 100);
        html += `
            <div style="background: #f8f9fa; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                <h5 style="margin-bottom: 0.5rem;">Floor ${floor}</h5>
                <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                    <span>Total: ${stats.total}</span>
                    <span>Occupancy: ${occupancyRate}%</span>
                </div>
                <div style="display: flex; gap: 0.5rem; font-size: 0.9rem;">
                    <span style="color: #4caf50;">Available: ${stats.available || 0}</span>
                    <span style="color: #f44336;">Occupied: ${stats.occupied || 0}</span>
                    <span style="color: #ff9800;">Maintenance: ${stats.maintenance || 0}</span>
                </div>
            </div>
        `;
    }

    document.getElementById('roomsByFloor').innerHTML = html;
}

function displayRoomsByType() {
    const roomsByType = {};
    hostelData.rooms.forEach(room => {
        if (!roomsByType[room.type]) {
            roomsByType[room.type] = { total: 0, occupied: 0, available: 0, maintenance: 0 };
        }
        roomsByType[room.type].total++;
        roomsByType[room.type][room.status]++;
    });

    let html = '';
    for (const [type, stats] of Object.entries(roomsByType)) {
        const occupancyRate = Math.round((stats.occupied / stats.total) * 100);
        html += `
            <div style="background: #f8f9fa; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                <h5 style="margin-bottom: 0.5rem;">${type}</h5>
                <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                    <span>Total: ${stats.total}</span>
                    <span>Occupancy: ${occupancyRate}%</span>
                </div>
                <div style="display: flex; gap: 0.5rem; font-size: 0.9rem;">
                    <span style="color: #4caf50;">Available: ${stats.available || 0}</span>
                    <span style="color: #f44336;">Occupied: ${stats.occupied || 0}</span>
                    <span style="color: #ff9800;">Maintenance: ${stats.maintenance || 0}</span>
                </div>
            </div>
        `;
    }

    document.getElementById('roomsByType').innerHTML = html;
}

function displayRoomsByStatus() {
    const roomsByStatus = {};
    hostelData.rooms.forEach(room => {
        roomsByStatus[room.status] = (roomsByStatus[room.status] || 0) + 1;
    });

    let html = '';
    const statusColors = {
        'available': '#4caf50',
        'occupied': '#f44336',
        'maintenance': '#ff9800'
    };

    for (const [status, count] of Object.entries(roomsByStatus)) {
        const percentage = Math.round((count / hostelData.rooms.length) * 100);
        html += `
            <div style="background: #f8f9fa; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                    <h5 style="color: ${statusColors[status]}; text-transform: capitalize;">${status}</h5>
                    <span style="font-weight: bold;">${count}</span>
                </div>
                <div style="background: #e0e0e0; height: 8px; border-radius: 4px; overflow: hidden;">
                    <div style="background: ${statusColors[status]}; height: 100%; width: ${percentage}%; transition: width 0.3s ease;"></div>
                </div>
                <p style="text-align: center; margin-top: 0.5rem; font-size: 0.9rem; color: #666;">${percentage}%</p>
            </div>
        `;
    }

    document.getElementById('roomsByStatus').innerHTML = html;
}

function displayPaymentOverview() {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const paidThisMonth = hostelData.payments
        .filter(payment => {
            const paymentDate = new Date(payment.date);
            return payment.status === 'Paid' && 
                   paymentDate.getMonth() === currentMonth && 
                   paymentDate.getFullYear() === currentYear;
        })
        .reduce((total, payment) => total + payment.amount, 0);

    const pendingPayments = hostelData.payments
        .filter(payment => payment.status === 'Pending')
        .reduce((total, payment) => total + payment.amount, 0);

    const overduePayments = hostelData.payments
        .filter(payment => payment.status === 'Overdue')
        .reduce((total, payment) => total + payment.amount, 0);

    document.getElementById('paidThisMonth').textContent = `₹${paidThisMonth.toLocaleString()}`;
    document.getElementById('pendingPayments').textContent = `₹${pendingPayments.toLocaleString()}`;
    document.getElementById('overduePayments').textContent = `₹${overduePayments.toLocaleString()}`;

    // Display recent payments
    const recentPayments = hostelData.payments
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 10);

    const recentPaymentsBody = document.getElementById('recentPaymentsBody');
    recentPaymentsBody.innerHTML = '';

    if (recentPayments.length === 0) {
        recentPaymentsBody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #666;">No recent payments</td></tr>';
        return;
    }

    recentPayments.forEach(payment => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${payment.id}</td>
            <td>${payment.studentId}</td>
            <td>${payment.type}</td>
            <td>₹${payment.amount.toLocaleString()}</td>
            <td><span class="status ${payment.status.toLowerCase()}">${payment.status}</span></td>
            <td>${formatDate(payment.date)}</td>
        `;
        recentPaymentsBody.appendChild(row);
    });
}

function downloadAllData() {
    const reportData = {
        generatedOn: new Date().toISOString(),
        summary: {
            totalRooms: hostelData.rooms.length,
            occupiedRooms: hostelData.rooms.filter(r => r.status === 'occupied').length,
            totalStudents: hostelData.students.length,
            activeComplaints: hostelData.complaints.filter(c => c.status === 'Open').length,
            totalRevenue: hostelData.payments.filter(p => p.status === 'Paid').reduce((sum, p) => sum + p.amount, 0)
        },
        rooms: hostelData.rooms,
        students: hostelData.students,
        bookings: hostelData.bookings,
        complaints: hostelData.complaints,
        payments: hostelData.payments
    };

    const reportText = `
HOSTEL MANAGEMENT SYSTEM - COMPLETE DATA EXPORT
Generated: ${new Date().toLocaleString()}

SUMMARY STATISTICS
==================
Total Rooms: ${reportData.summary.totalRooms}
Occupied Rooms: ${reportData.summary.occupiedRooms}
Total Students: ${reportData.summary.totalStudents}
Active Complaints: ${reportData.summary.activeComplaints}
Total Revenue: ₹${reportData.summary.totalRevenue.toLocaleString()}

ROOMS DATA
==========
${hostelData.rooms.map(room => 
    `${room.id} | Floor ${room.floor} | ${room.type} | ${room.capacity} capacity | ₹${room.price} | ${room.status}${room.student ? ` | ${room.student}` : ''}`
).join('\n')}

STUDENTS DATA
=============
${hostelData.students.map(student => 
    `${student.id} | ${student.name} | ${student.email} | ${student.phone} | Room ${student.roomNumber}`
).join('\n')}

BOOKINGS DATA
=============
${hostelData.bookings.map(booking => 
    `${booking.id} | ${booking.name} | ${booking.studentId} | ${booking.roomType} | ${booking.status} | ${formatDate(booking.date)}`
).join('\n')}

COMPLAINTS DATA
===============
${hostelData.complaints.map(complaint => 
    `${complaint.id} | ${complaint.title} | ${complaint.category || 'General'} | ${complaint.urgency} | ${complaint.status} | ${complaint.studentName} | ${formatDate(complaint.date)}`
).join('\n')}

PAYMENTS DATA
=============
${hostelData.payments.map(payment => 
    `${payment.id} | ${payment.studentId} | ${payment.type} | ₹${payment.amount} | ${payment.status} | ${formatDate(payment.date)}`
).join('\n')}
    `.trim();

    downloadData(reportText, `Hostel_Complete_Data_${new Date().toISOString().split('T')[0]}.txt`);
    showNotification('Complete data exported successfully!', 'success');
}

function generateReports() {
    const reportData = generateDetailedReports();
    downloadData(reportData, `Hostel_Analytics_Report_${new Date().toISOString().split('T')[0]}.txt`);
    showNotification('Analytics report generated successfully!', 'success');
}

function generateDetailedReports() {
    const occupancyRate = Math.round((hostelData.rooms.filter(r => r.status === 'occupied').length / hostelData.rooms.length) * 100);
    const avgComplaintResponseTime = '2.3 days'; // Mock data
    const monthlyGrowth = '+12%'; // Mock data

    return `
HOSTEL ANALYTICS REPORT
Generated: ${new Date().toLocaleString()}

KEY METRICS
===========
Occupancy Rate: ${occupancyRate}%
Average Complaint Response Time: ${avgComplaintResponseTime}
Monthly Growth: ${monthlyGrowth}
Student Satisfaction: 4.2/5 (Mock)

ROOM UTILIZATION
================
${Object.entries(hostelData.rooms.reduce((acc, room) => {
    acc[room.type] = acc[room.type] || { total: 0, occupied: 0 };
    acc[room.type].total++;
    if (room.status === 'occupied') acc[room.type].occupied++;
    return acc;
}, {})).map(([type, stats]) => 
    `${type}: ${Math.round((stats.occupied / stats.total) * 100)}% occupied (${stats.occupied}/${stats.total})`
).join('\n')}

REVENUE ANALYSIS
================
Total Revenue: ₹${hostelData.payments.filter(p => p.status === 'Paid').reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
Pending Payments: ₹${hostelData.payments.filter(p => p.status === 'Pending').reduce((sum, p) => sum + p.amount, 0).toLocaleString()}

COMPLAINT ANALYSIS
==================
Total Complaints: ${hostelData.complaints.length}
Open Complaints: ${hostelData.complaints.filter(c => c.status === 'Open').length}
Resolved Complaints: ${hostelData.complaints.filter(c => c.status === 'Resolved').length}

By Urgency:
${Object.entries(hostelData.complaints.reduce((acc, complaint) => {
    acc[complaint.urgency] = (acc[complaint.urgency] || 0) + 1;
    return acc;
}, {})).map(([urgency, count]) => `${urgency}: ${count}`).join('\n')}

By Category:
${Object.entries(hostelData.complaints.reduce((acc, complaint) => {
    const category = complaint.category || 'General';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
}, {})).map(([category, count]) => `${category}: ${count}`).join('\n')}

RECOMMENDATIONS
===============
1. ${occupancyRate > 85 ? 'Consider expanding capacity - high occupancy rate' : 'Focus on marketing to increase occupancy'}
2. ${hostelData.complaints.filter(c => c.status === 'Open').length > 5 ? 'Prioritize complaint resolution' : 'Maintain good complaint response time'}
3. Regular maintenance scheduling recommended for optimal room condition
4. Consider digital payment integration for better payment tracking
    `.trim();
}

function sendBulkNotifications() {
    // Simulate sending notifications
    const notifications = [
        'Monthly rent due reminder sent to all students',
        'Maintenance schedule notification sent',
        'New facility announcement published',
        'Safety guidelines reminder distributed'
    ];

    const randomNotification = notifications[Math.floor(Math.random() * notifications.length)];
    showNotification(randomNotification, 'success');
    console.log('Bulk notification sent:', randomNotification);
}

function backupData() {
    // Simulate backup process
    const backupData = {
        timestamp: new Date().toISOString(),
        data: hostelData,
        checksum: Math.random().toString(36).substr(2, 9).toUpperCase()
    };

    downloadData(JSON.stringify(backupData, null, 2), `Hostel_Backup_${new Date().toISOString().split('T')[0]}.json`);
    showNotification('Data backup created successfully!', 'success');
    console.log('Backup created with checksum:', backupData.checksum);
}

// Initialize on page load
if (getCurrentPage() === 'admin') {
    document.addEventListener('DOMContentLoaded', initAdminPage);
}