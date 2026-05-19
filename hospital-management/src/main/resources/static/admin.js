const BASE_URL = "https://hospital-management-system-ht9d.onrender.com/api";

// DOM Elements
const mainTitle = document.getElementById('main-title');
const actionButtonsContainer = document.getElementById('action-buttons-container');
const formPanel = document.getElementById('formPanel');
const formTitle = document.getElementById('formTitle');
const actionForm = document.getElementById('actionForm');
const closeFormBtn = document.getElementById('closeForm');

// Initialize admin page
document.addEventListener('DOMContentLoaded', function() {
    // Set up sidebar event listeners
    setupSidebar();
    // Load default section
    loadSection('booked-patients');
});

// Setup sidebar navigation
function setupSidebar() {
    const sidebarButtons = document.querySelectorAll('#sidebar button');
    sidebarButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            sidebarButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            // Load the corresponding section
            const section = this.getAttribute('data-section');
            loadSection(section);
        });
    });
}

// Load section content
function loadSection(sectionKey) {
    const section = sections[sectionKey];
    if (!section) return;

    // Update main title
    mainTitle.textContent = section.title;

    // Clear action buttons
    actionButtonsContainer.innerHTML = '';

    // Clear dynamic content
    const existingDynamicContent = document.getElementById('dynamic-content');
    if (existingDynamicContent) {
        existingDynamicContent.remove();
    }

    // Create dynamic content container
    const dynamicContent = document.createElement('div');
    dynamicContent.id = 'dynamic-content';
    document.querySelector('main').appendChild(dynamicContent);

    // Handle different section types
    if (sectionKey === 'booked-patients') {
        loadBookedPatients();
    } else {
        // Add action buttons for other sections
        section.actions.forEach(action => {
            const btn = document.createElement("button");
            btn.textContent = action.name;
            btn.className = "section-btn";
            btn.addEventListener("click", () => {
                if (action.isActionOnly) {
                    action.action();
                } else {
                    openForm(action);
                }
            });
            actionButtonsContainer.appendChild(btn);
        });
    }
    closeForm();
}

// Open form panel
function openForm(action) {
    formTitle.textContent = action.name;
    actionForm.innerHTML = '';

    // Create form fields
    action.fields.forEach(field => {
        const div = document.createElement('div');
        div.className = 'form-group';

        const label = document.createElement('label');
        label.textContent = field.label;
        label.htmlFor = field.name;

        let input;
        if (field.type === 'textarea') {
            input = document.createElement('textarea');
            input.rows = 4;
        } else {
            input = document.createElement('input');
            input.type = field.type;
        }

        input.id = field.name;
        input.name = field.name;
        input.required = field.required || false;

        if (field.step) {
            input.step = field.step;
        }

        div.appendChild(label);
        div.appendChild(input);
        actionForm.appendChild(div);
    });

    // Create submit button
    const submitBtn = document.createElement('button');
    submitBtn.type = 'submit';
    submitBtn.textContent = 'Submit';
    actionForm.appendChild(submitBtn);

    // Set form submit handler
    actionForm.onsubmit = function(e) {
        e.preventDefault();
        const formData = new FormData(actionForm);
        const data = {};
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }
        action.action(data);
    };

    // Show form panel
    formPanel.setAttribute('aria-hidden', 'false');
    formPanel.style.display = 'block';
}

// Close form panel
function closeForm() {
    formPanel.setAttribute('aria-hidden', 'true');
    formPanel.style.display = 'none';
    actionForm.reset();
}

// Close form when close button is clicked
closeFormBtn.addEventListener('click', closeForm);

// Sections configuration
const sections = {
    'booked-patients': {
        title: "📋 Booked Patients",
        actions: [
            {
                name: "Refresh Booked Patients",
                isActionOnly: true,
                action: () => loadBookedPatients()
            }
        ]
    },
    'bills': {
        title: "💰 Bills Management",
        actions: [
            {
                name: "View All Bills",
                isActionOnly: true,
                action: () => loadAllBills()
            }
        ]
    },
    'prescriptions': {
         title: "💊 Prescriptions",
         actions: [
             {
                 name: "View All Prescriptions",
                 isActionOnly: true,
                 action: () => loadAllPrescriptions()
             },
             {
                 name: "Create Prescription",
                 fields: [
                     { name: "appointmentId", type: "number", label: "Appointment ID", required: true },
                     { name: "medicine", type: "text", label: "Medicine", required: true },
                     { name: "notes", type: "textarea", label: "Notes" }  // ✅ 'notes' not 'note'
                 ],
                 action: (data) => createPrescription(data)
             }
         ]
     },
    'appointments': {
        title: "📅 Appointments",
        actions: [
            {
                name: "View All Appointments",
                isActionOnly: true,
                action: () => loadAllAppointments()
            }
        ]
    },
    'departments': {
        title: "🏥 Departments",
        actions: [
            {
                name: "View All Departments",
                isActionOnly: true,
                action: () => loadAllDepartments()
            }
        ]
    }
    };

// Load Booked Patients
async function loadBookedPatients() {
    try {
        const response = await fetch(`${BASE_URL}/appointments`);
        if (!response.ok) throw new Error('Failed to fetch appointments');

        const appointments = await response.json();
        const dynamicContent = document.getElementById('dynamic-content');
        dynamicContent.innerHTML = '';

        const bookedAppointments = appointments.filter(apt => apt.status === 'BOOKED');

        if (bookedAppointments.length === 0) {
            dynamicContent.innerHTML = '<p>No booked patients found.</p>';
            return;
        }

        bookedAppointments.forEach(apt => {
            const patientCard = document.createElement('div');
            patientCard.className = 'patient-card';
            patientCard.innerHTML = `
                <h4>${apt.patient.name} (Appointment ID: ${apt.id})</h4>
                <p><strong>Email:</strong> ${apt.patient.email}</p>
                <p><strong>Phone:</strong> ${apt.patient.phone}</p>
                <p><strong>Doctor:</strong> ${apt.doctor.name} - ${apt.doctor.specialization}</p>
                <p><strong>Department:</strong> ${apt.department.name}</p>
                <p><strong>Date:</strong> ${apt.appointmentDate} at ${apt.appointmentTime}</p>
                <p><strong>Status:</strong> <span class="status-${apt.status.toLowerCase()}">${apt.status}</span></p>

                <div class="patient-actions">
                    <button class="action-btn generate-bill" onclick="generateBill(${apt.id})">
                        Generate Bill
                    </button>
                    <button class="action-btn update-status" onclick="updateAppointmentStatus(${apt.id}, 'COMPLETED')">
                        Mark Completed
                    </button>
                    <button class="action-btn cancel-appointment" onclick="updateAppointmentStatus(${apt.id}, 'CANCELLED')">
                        Cancel Appointment
                    </button>
                </div>
            `;
            dynamicContent.appendChild(patientCard);
        });

    } catch (error) {
        const dynamicContent = document.getElementById('dynamic-content');
        dynamicContent.innerHTML = `<p class="error">Error loading booked patients: ${error.message}</p>`;
    }
}

// Generate Bill function - SIMPLE FIX
// Generate Bill function - USING XMLHttpRequest (No charset issue)
async function generateBill(appointmentId) {
    const amount = prompt('Enter bill amount:');
    if (!amount || isNaN(amount) || amount <= 0) {
        alert('Please enter a valid amount');
        return;
    }

    return new Promise((resolve, reject) => {
        const billData = {
            appointment: {
                id: parseInt(appointmentId)
            },
            amount: parseFloat(amount)
        };

        const xhr = new XMLHttpRequest();
        xhr.open('POST', `${BASE_URL}/bills`);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.setRequestHeader('Accept', 'application/json');

        xhr.onload = function() {
            if (xhr.status === 200) {
                const result = JSON.parse(xhr.responseText);
                alert(`✅ Bill generated successfully!\nBill ID: ${result.billId}\nAmount: $${result.amount}`);
                resolve(result);
            } else {
                const error = JSON.parse(xhr.responseText);
                alert('❌ Error generating bill: ' + (error.error || error.message));
                reject(new Error(error.error || 'Bill creation failed'));
            }
        };

        xhr.onerror = function() {
            alert('❌ Network error generating bill');
            reject(new Error('Network error'));
        };

        xhr.send(JSON.stringify(billData));
    });
}

// Update Appointment Status
async function updateAppointmentStatus(appointmentId, status) {
    try {
        const updateData = { status: status };

        const response = await fetch(`${BASE_URL}/appointments/${appointmentId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updateData)
        });

        if (!response.ok) throw new Error('Failed to update appointment status');

        alert(`✅ Appointment ${status.toLowerCase()} successfully!`);
        loadBookedPatients(); // Refresh the list

    } catch (error) {
        alert('❌ Error updating appointment: ' + error.message);
    }
}

// Other admin functions
async function loadAllBills() {
    try {
        const response = await fetch(`${BASE_URL}/bills`);
        const bills = await response.json();
        const dynamicContent = document.getElementById('dynamic-content');
        dynamicContent.innerHTML = `<h3>All Bills (${bills.length})</h3>`;

        bills.forEach(bill => {
            const billCard = document.createElement('div');
            billCard.className = 'patient-card';
            billCard.innerHTML = `
                <h4>Bill ID: ${bill.id}</h4>
                <p><strong>Appointment ID:</strong> ${bill.appointment.id}</p>
                <p><strong>Amount:</strong> $${bill.amount}</p>
                <p><strong>Created:</strong> ${new Date(bill.createdAt).toLocaleString()}</p>
            `;
            dynamicContent.appendChild(billCard);
        });
    } catch (error) {
        const dynamicContent = document.getElementById('dynamic-content');
        dynamicContent.innerHTML = `<p class="error">Error loading bills: ${error.message}</p>`;
    }
}

async function createBill(data) {
    try {
        const billData = {
            appointment: { id: parseInt(data.appointmentId) },
            amount: parseFloat(data.amount),
            createdAt: new Date().toISOString()
        };

        const response = await fetch(`${BASE_URL}/bills`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(billData)
        });

        if (response.ok) {
            alert('Bill created successfully!');
            closeForm();
        } else {
            throw new Error('Failed to create bill');
        }
    } catch (error) {
        alert('Error creating bill: ' + error.message);
    }
}

async function loadAllPrescriptions() {
    try {
        const response = await fetch(`${BASE_URL}/prescriptions`);
        if (!response.ok) throw new Error('Failed to fetch prescriptions');

        const prescriptions = await response.json();
        const dynamicContent = document.getElementById('dynamic-content');
        dynamicContent.innerHTML = `<h3>All Prescriptions (${prescriptions.length})</h3>`;

        if (prescriptions.length === 0) {
            dynamicContent.innerHTML += '<p>No prescriptions found.</p>';
            return;
        }

        prescriptions.forEach(prescription => {
            const prescriptionCard = document.createElement('div');
            prescriptionCard.className = 'patient-card';
            prescriptionCard.innerHTML = `
                <h4>Prescription ID: ${prescription.id}</h4>
                <p><strong>Appointment ID:</strong> ${prescription.appointment ? prescription.appointment.id : 'N/A'}</p>
                <p><strong>Medicine:</strong> ${prescription.medicine || 'Not specified'}</p>
                <p><strong>Notes:</strong> ${prescription.notes || 'None'}</p>  <!-- ✅ FIXED: notes not note -->
                <p><strong>Created:</strong> ${prescription.createdAt ? new Date(prescription.createdAt).toLocaleString() : 'Not available'}</p>
            `;
            dynamicContent.appendChild(prescriptionCard);
        });
    } catch (error) {
        const dynamicContent = document.getElementById('dynamic-content');
        dynamicContent.innerHTML = `<p class="error">Error loading prescriptions: ${error.message}</p>`;
    }
}

async function createPrescription(data) {
    try {
        // Debug: log what we're receiving from the form
        console.log('Form data received:', data);

        const prescriptionData = {
            appointmentId: parseInt(data.appointmentId),  // ✅ Direct appointmentId
            medicine: data.medicine,
            notes: data.notes || "None"  // ✅ Use notes from form data
        };

        console.log('Sending prescription data to backend:', prescriptionData);

        const response = await fetch(`${BASE_URL}/prescriptions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(prescriptionData)
        });

        const result = await response.json();
        console.log('Prescription creation result:', result);

        if (response.ok) {
            alert('✅ Prescription created successfully!');
            closeForm();
            loadAllPrescriptions(); // Refresh the list
        } else {
            throw new Error(result.message || result.error || 'Failed to create prescription');
        }
    } catch (error) {
        console.error('Error creating prescription:', error);
        alert('❌ Error creating prescription: ' + error.message);
    }
}

async function loadAllAppointments() {
    try {
        const response = await fetch(`${BASE_URL}/appointments`);
        const appointments = await response.json();
        const dynamicContent = document.getElementById('dynamic-content');
        dynamicContent.innerHTML = `<h3>All Appointments (${appointments.length})</h3>`;

        appointments.forEach(apt => {
            const aptCard = document.createElement('div');
            aptCard.className = 'patient-card';
            aptCard.innerHTML = `
                <h4>Appointment ID: ${apt.id}</h4>
                <p><strong>Patient:</strong> ${apt.patient.name} (${apt.patient.email})</p>
                <p><strong>Doctor:</strong> ${apt.doctor.name} - ${apt.doctor.specialization}</p>
                <p><strong>Department:</strong> ${apt.department.name}</p>
                <p><strong>Date:</strong> ${apt.appointmentDate} at ${apt.appointmentTime}</p>
                <p><strong>Status:</strong> <span class="status-${apt.status.toLowerCase()}">${apt.status}</span></p>
            `;
            dynamicContent.appendChild(aptCard);
        });
    } catch (error) {
        const dynamicContent = document.getElementById('dynamic-content');
        dynamicContent.innerHTML = `<p class="error">Error loading appointments: ${error.message}</p>`;
    }
}

async function loadAllDepartments() {
    try {
        const response = await fetch(`${BASE_URL}/departments`);
        const departments = await response.json();
        const dynamicContent = document.getElementById('dynamic-content');
        dynamicContent.innerHTML = `<h3>All Departments (${departments.length})</h3>`;

        departments.forEach(dept => {
            const deptCard = document.createElement('div');
            deptCard.className = 'patient-card';
            deptCard.innerHTML = `
                <h4>${dept.name}</h4>
                <p><strong>ID:</strong> ${dept.id}</p>
                <p><strong>Description:</strong> ${dept.description || 'No description'}</p>
                <p><strong>Doctors:</strong> ${dept.doctors ? dept.doctors.length : 0}</p>
            `;
            dynamicContent.appendChild(deptCard);
        });
    } catch (error) {
        const dynamicContent = document.getElementById('dynamic-content');
        dynamicContent.innerHTML = `<p class="error">Error loading departments: ${error.message}</p>`;
    }
}

async function createDepartment(data) {
    try {
        const departmentData = {
            name: data.name,
            description: data.description
        };

        const response = await fetch(`${BASE_URL}/departments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(departmentData)
        });

        if (response.ok) {
            alert('Department created successfully!');
            closeForm();
        } else {
            throw new Error('Failed to create department');
        }
    } catch (error) {
        alert('Error creating department: ' + error.message);
    }
}

async function checkAllBills() {
    try {
        const response = await fetch(`${BASE_URL}/bills`);
        const bills = await response.json();
        console.log('All bills in database:', bills);
        alert(`Found ${bills.length} bills in database. Check console for details.`);
    } catch (error) {
        console.error('Error checking bills:', error);
        alert('Error checking bills: ' + error.message);
    }
}





function openForm(action) {
    formTitle.textContent = action.name;
    actionForm.innerHTML = '';

    // Create form fields
    action.fields.forEach(field => {
        const div = document.createElement('div');
        div.className = 'form-group';

        const label = document.createElement('label');
        label.textContent = field.label;
        label.htmlFor = field.name;

        let input;
        if (field.type === 'textarea') {
            input = document.createElement('textarea');
            input.rows = 4;
        } else {
            input = document.createElement('input');
            input.type = field.type;
        }

        input.id = field.name;
        input.name = field.name;
        input.required = field.required || false;

        if (field.step) {
            input.step = field.step;
        }

        div.appendChild(label);
        div.appendChild(input);
        actionForm.appendChild(div);
    });

    // Create submit button
    const submitBtn = document.createElement('button');
    submitBtn.type = 'submit';
    submitBtn.textContent = 'Submit';
    actionForm.appendChild(submitBtn);

    // Set form submit handler
    actionForm.onsubmit = function(e) {
        e.preventDefault();
        const formData = new FormData(actionForm);
        const data = {};
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }

        // Debug: log what the form collected
        console.log('Form collected data:', data);

        action.action(data);
    };

    // Show form panel
    formPanel.setAttribute('aria-hidden', 'false');
    formPanel.style.display = 'block';
}
