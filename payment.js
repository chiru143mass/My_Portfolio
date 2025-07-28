// Payment Management JavaScript

let currentReceiptData = null;

function initPaymentPage() {
    console.log('Initializing Payment Page');
    setupPaymentForm();
    displayPayments();
}

function setupPaymentForm() {
    const paymentForm = document.getElementById('paymentForm');
    if (paymentForm) {
        paymentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            processPayment();
        });
    }
}

function updatePaymentAmount() {
    const paymentTypeSelect = document.getElementById('paymentType');
    const amountInput = document.getElementById('amount');
    
    if (paymentTypeSelect.value) {
        const selectedOption = paymentTypeSelect.options[paymentTypeSelect.selectedIndex];
        const amount = selectedOption.getAttribute('data-amount');
        if (amount && amount !== '0') {
            amountInput.value = amount;
        }
    }
}

function displayPayments() {
    const tableBody = document.getElementById('paymentsTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    if (hostelData.payments.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: #666;">No payments found</td></tr>';
        return;
    }
    
    hostelData.payments.forEach((payment, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${payment.id}</td>
            <td>${payment.studentId}</td>
            <td>${payment.roomNumber}</td>
            <td>${payment.type}</td>
            <td>₹${payment.amount.toLocaleString()}</td>
            <td><span class="status ${payment.status.toLowerCase()}">${payment.status}</span></td>
            <td>${formatDate(payment.date)}</td>
            <td>
                ${payment.status === 'Paid' ? 
                    `<button class="btn btn-sm" onclick="viewReceipt(${index})" style="background: #4CAF50; color: white;">
                        <i class="fas fa-receipt"></i> Receipt
                    </button>` : 
                    '<span style="color: #666;">-</span>'
                }
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function processPayment() {
    const formData = new FormData(document.getElementById('paymentForm'));
    
    const paymentData = {
        id: generateId('P'),
        studentId: formData.get('studentId'),
        studentName: formData.get('studentName'),
        roomNumber: formData.get('roomNumber'),
        type: formData.get('paymentType'),
        amount: parseInt(formData.get('amount')),
        paymentMethod: formData.get('paymentMethod'),
        description: formData.get('description') || '',
        status: 'Processing',
        date: new Date().toISOString().split('T')[0],
        dateTime: new Date().toISOString(),
        transactionId: generateTransactionId()
    };
    
    // Validation
    const validationRules = {
        studentId: { required: true, label: 'Student ID', minLength: 3 },
        studentName: { required: true, label: 'Student Name', minLength: 2 },
        roomNumber: { required: true, label: 'Room Number' },
        paymentType: { required: true, label: 'Payment Type' },
        amount: { required: true, label: 'Amount' },
        paymentMethod: { required: true, label: 'Payment Method' }
    };
    
    const errors = validateForm(Object.fromEntries(formData), validationRules);
    
    if (errors.length > 0) {
        showNotification(errors.join(', '), 'error');
        return;
    }
    
    if (paymentData.amount < 1) {
        showNotification('Amount must be greater than ₹0', 'error');
        return;
    }
    
    // Simulate payment processing
    showNotification('Processing payment...', 'success');
    
    // Show loading state
    const submitBtn = document.querySelector('#paymentForm button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span class="loading"></span> Processing...';
    submitBtn.disabled = true;
    
    // Simulate payment gateway processing
    setTimeout(() => {
        // 95% success rate simulation
        const isSuccess = Math.random() > 0.05;
        
        if (isSuccess) {
            paymentData.status = 'Paid';
            paymentData.processingTime = new Date().toISOString();
            
            // Add payment to data
            hostelData.payments.push(paymentData);
            saveData();
            
            // Generate and show receipt
            currentReceiptData = paymentData;
            showPaymentReceipt(paymentData);
            
            // Reset form and update display
            document.getElementById('paymentForm').reset();
            displayPayments();
            
            showNotification('Payment successful! Receipt generated.', 'success');
            sendAdminAlert(`Payment received: ₹${paymentData.amount} from ${paymentData.studentName} (${paymentData.studentId})`);
            
        } else {
            paymentData.status = 'Failed';
            paymentData.failureReason = 'Payment gateway error';
            
            showNotification('Payment failed! Please try again or contact support.', 'error');
        }
        
        // Reset button
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        
    }, 2000); // 2 second processing simulation
}

function generateTransactionId() {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substr(2, 5).toUpperCase();
    return `TXN${timestamp.substr(-6)}${random}`;
}

function showPaymentReceipt(paymentData) {
    const receiptContent = document.getElementById('receiptContent');
    
    receiptContent.innerHTML = `
        <div style="text-align: center; margin-bottom: 2rem;">
            <h2 style="color: #667eea; margin-bottom: 0.5rem;">Payment Receipt</h2>
            <p style="color: #666;">Premier Hostel Management System</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 1.5rem; border-radius: 8px; margin-bottom: 1.5rem;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div>
                    <p><strong>Receipt No:</strong> ${paymentData.id}</p>
                    <p><strong>Transaction ID:</strong> ${paymentData.transactionId}</p>
                    <p><strong>Date:</strong> ${formatDate(paymentData.date)}</p>
                    <p><strong>Time:</strong> ${new Date(paymentData.dateTime).toLocaleTimeString()}</p>
                </div>
                <div>
                    <p><strong>Student ID:</strong> ${paymentData.studentId}</p>
                    <p><strong>Student Name:</strong> ${paymentData.studentName}</p>
                    <p><strong>Room Number:</strong> ${paymentData.roomNumber}</p>
                    <p><strong>Payment Method:</strong> ${paymentData.paymentMethod}</p>
                </div>
            </div>
        </div>
        
        <div style="border: 2px solid #667eea; border-radius: 8px; padding: 1rem; margin-bottom: 1.5rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                <span style="font-size: 1.1rem;"><strong>Payment Details:</strong></span>
                <span style="background: #4CAF50; color: white; padding: 4px 8px; border-radius: 4px; font-size: 0.9rem;">
                    ✓ PAID
                </span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                <span>${paymentData.type}</span>
                <span>₹${paymentData.amount.toLocaleString()}</span>
            </div>
            ${paymentData.description ? `
                <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #ddd;">
                    <p><strong>Description:</strong> ${paymentData.description}</p>
                </div>
            ` : ''}
            <div style="border-top: 2px solid #667eea; margin-top: 1rem; padding-top: 1rem;">
                <div style="display: flex; justify-content: space-between; font-size: 1.2rem; font-weight: bold;">
                    <span>Total Amount Paid:</span>
                    <span>₹${paymentData.amount.toLocaleString()}</span>
                </div>
            </div>
        </div>
        
        <div style="background: #e8f5e8; padding: 1rem; border-radius: 8px; text-align: center;">
            <p style="margin-bottom: 0.5rem;"><strong>Thank you for your payment!</strong></p>
            <p style="color: #666; font-size: 0.9rem;">Please keep this receipt for your records.</p>
            <p style="color: #666; font-size: 0.9rem;">For any queries, contact: accounts@premierhostel.com</p>
        </div>
    `;
    
    showModal('receiptModal');
}

function viewReceipt(index) {
    const payment = hostelData.payments[index];
    currentReceiptData = payment;
    showPaymentReceipt(payment);
}

function downloadReceipt() {
    if (!currentReceiptData) return;
    
    // Simulate PDF download
    const receiptText = `
PAYMENT RECEIPT
Premier Hostel Management System

Receipt No: ${currentReceiptData.id}
Transaction ID: ${currentReceiptData.transactionId}
Date: ${formatDate(currentReceiptData.date)}
Student ID: ${currentReceiptData.studentId}
Student Name: ${currentReceiptData.studentName}
Room Number: ${currentReceiptData.roomNumber}
Payment Type: ${currentReceiptData.type}
Amount: ₹${currentReceiptData.amount.toLocaleString()}
Payment Method: ${currentReceiptData.paymentMethod}
Status: PAID

Thank you for your payment!
For any queries, contact: accounts@premierhostel.com
    `.trim();
    
    downloadData(receiptText, `Receipt_${currentReceiptData.id}_${currentReceiptData.date}.txt`);
    showNotification('Receipt downloaded successfully!', 'success');
}

// Add payment status styles
function addPaymentStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .status.paid {
            background: #d4edda;
            color: #155724;
        }
        .status.pending {
            background: #fff3cd;
            color: #856404;
        }
        .status.failed {
            background: #f8d7da;
            color: #721c24;
        }
        .status.processing {
            background: #cce7ff;
            color: #0066cc;
        }
    `;
    document.head.appendChild(style);
}

// Initialize on page load
if (getCurrentPage() === 'payment') {
    document.addEventListener('DOMContentLoaded', function() {
        addPaymentStyles();
        initPaymentPage();
    });
}