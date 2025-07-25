// Room Management JavaScript

function initRoomsPage() {
    console.log('Initializing Rooms Page');
    displayRooms();
    setupRoomForms();
}

function displayRooms(filteredRooms = null) {
    const roomsToShow = filteredRooms || hostelData.rooms;
    const tableBody = document.getElementById('roomsTableBody');
    
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    roomsToShow.forEach((room, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${room.id}</td>
            <td>${room.floor}</td>
            <td>${room.type}</td>
            <td>${room.capacity}</td>
            <td>₹${room.price.toLocaleString()}</td>
            <td><span class="status ${room.status}">${room.status.charAt(0).toUpperCase() + room.status.slice(1)}</span></td>
            <td>${room.student || '-'}</td>
            <td>
                <button class="btn btn-sm" onclick="editRoom(${index})" style="background: #667eea; color: white; margin-right: 5px;">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm" onclick="deleteRoom(${index})" style="background: #f44336; color: white;">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function filterRooms() {
    const floorFilter = document.getElementById('floorFilter').value;
    const statusFilter = document.getElementById('statusFilter').value;
    const typeFilter = document.getElementById('typeFilter').value;
    
    let filteredRooms = hostelData.rooms.filter(room => {
        const floorMatch = !floorFilter || room.floor.toString() === floorFilter;
        const statusMatch = !statusFilter || room.status === statusFilter;
        const typeMatch = !typeFilter || room.type === typeFilter;
        
        return floorMatch && statusMatch && typeMatch;
    });
    
    displayRooms(filteredRooms);
}

function setupRoomForms() {
    // Add Room Form
    const addRoomForm = document.getElementById('addRoomForm');
    if (addRoomForm) {
        addRoomForm.addEventListener('submit', function(e) {
            e.preventDefault();
            addRoom();
        });
    }
    
    // Edit Room Form
    const editRoomForm = document.getElementById('editRoomForm');
    if (editRoomForm) {
        editRoomForm.addEventListener('submit', function(e) {
            e.preventDefault();
            updateRoom();
        });
    }
}

function addRoom() {
    const formData = new FormData(document.getElementById('addRoomForm'));
    const roomData = {
        id: formData.get('roomId'),
        floor: parseInt(formData.get('floor')),
        type: formData.get('roomType'),
        capacity: parseInt(formData.get('capacity')),
        price: parseInt(formData.get('price')),
        status: formData.get('status')
    };
    
    // Validation
    const validationRules = {
        roomId: { required: true, label: 'Room ID' },
        floor: { required: true, label: 'Floor' },
        roomType: { required: true, label: 'Room Type' },
        capacity: { required: true, label: 'Capacity' },
        price: { required: true, label: 'Price' },
        status: { required: true, label: 'Status' }
    };
    
    const errors = validateForm(Object.fromEntries(formData), validationRules);
    
    if (errors.length > 0) {
        showNotification(errors.join(', '), 'error');
        return;
    }
    
    // Check if room ID already exists
    if (hostelData.rooms.some(room => room.id === roomData.id)) {
        showNotification('Room ID already exists!', 'error');
        return;
    }
    
    // Add room to data
    hostelData.rooms.push(roomData);
    saveData();
    
    // Update display
    displayRooms();
    hideModal('addRoomModal');
    document.getElementById('addRoomForm').reset();
    
    showNotification('Room added successfully!');
    sendAdminAlert(`New room ${roomData.id} added to the system`);
}

function editRoom(index) {
    const room = hostelData.rooms[index];
    
    // Populate edit form
    document.getElementById('editRoomIndex').value = index;
    document.getElementById('editRoomId').value = room.id;
    document.getElementById('editFloor').value = room.floor;
    document.getElementById('editRoomType').value = room.type;
    document.getElementById('editCapacity').value = room.capacity;
    document.getElementById('editPrice').value = room.price;
    document.getElementById('editStatus').value = room.status;
    document.getElementById('editStudent').value = room.student || '';
    
    showModal('editRoomModal');
}

function updateRoom() {
    const formData = new FormData(document.getElementById('editRoomForm'));
    const index = parseInt(formData.get('editRoomIndex'));
    
    const updatedRoom = {
        id: formData.get('editRoomId'),
        floor: parseInt(formData.get('editFloor')),
        type: formData.get('editRoomType'),
        capacity: parseInt(formData.get('editCapacity')),
        price: parseInt(formData.get('editPrice')),
        status: formData.get('editStatus'),
        student: formData.get('editStudent') || undefined
    };
    
    // Remove student if status is not occupied
    if (updatedRoom.status !== 'occupied') {
        delete updatedRoom.student;
    }
    
    // Update room in data
    hostelData.rooms[index] = updatedRoom;
    saveData();
    
    // Update display
    displayRooms();
    hideModal('editRoomModal');
    
    showNotification('Room updated successfully!');
    sendAdminAlert(`Room ${updatedRoom.id} information updated`);
}

function deleteRoom(index) {
    const room = hostelData.rooms[index];
    
    if (confirm(`Are you sure you want to delete room ${room.id}?`)) {
        hostelData.rooms.splice(index, 1);
        saveData();
        displayRooms();
        
        showNotification('Room deleted successfully!');
        sendAdminAlert(`Room ${room.id} has been deleted from the system`);
    }
}

// Initialize on page load
if (getCurrentPage() === 'rooms') {
    document.addEventListener('DOMContentLoaded', initRoomsPage);
}