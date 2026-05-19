const API_BASE = "https://hospital-management-system-ht9d.onrender.com/api/doctors";

// Setup event listeners
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('load-doctors').addEventListener('click', loadAllDoctors);
    document.getElementById("add-doctor-form").addEventListener('submit', addDoctor);
    document.getElementById('get-doctor-form').addEventListener('submit', getDoctorById);
    document.getElementById("update-doctor-form").addEventListener('submit', updateDoctor);
    document.getElementById('delete-doctor-form').addEventListener('submit', deleteDoctor);
});

// Load All Doctors
async function loadAllDoctors() {
    const doctorsList = document.getElementById('doctors-list');
    const messageDiv = document.getElementById('all-doctor-message');

    doctorsList.innerHTML = '';
    messageDiv.innerHTML = '';

    try {
        const response = await fetch(API_BASE);
        const doctors = await response.json();

        if (doctors.length === 0) {
            doctorsList.innerHTML = '<li>No doctors found</li>';
            return;
        }

        doctors.forEach(doctor => {
            const li = document.createElement('li');
            li.innerHTML = `
                <strong>ID:</strong> ${doctor.id}<br>
                <strong>Name:</strong> ${doctor.name}<br>
                <strong>Specialization:</strong> ${doctor.specialization}<br>
                <strong>Email:</strong> ${doctor.email}<br>
                <strong>Phone:</strong> ${doctor.phone || 'N/A'}<br>
                <strong>Department:</strong> ${doctor.departmentName || 'Not assigned'}
                <hr>
            `;
            doctorsList.appendChild(li);
        });

    } catch (error) {
        showMessage('all-doctor-message', `❌ ${error.message}`, 'error');
    }
}

// Add Doctor
async function addDoctor(e) {
    e.preventDefault();
    const form = e.target;
    const data = {
        name: form.name.value.trim(),
        specialization: form.specialization.value.trim(),
        email: form.email.value.trim(),
        phone: form.phone.value.trim(),
    };

    try {
        const response = await fetch(API_BASE, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok) {
            showMessage('add-doctor-message', `✅ Doctor added successfully with ID ${result.id}`, 'success');
            form.reset();
        } else {
            throw new Error(result.error || 'Failed to add doctor');
        }

    } catch (error) {
        showMessage('add-doctor-message', `❌ ${error.message}`, 'error');
    }
}

// Get Doctor By Id
async function getDoctorById(e) {
    e.preventDefault();
    const id = document.getElementById('doctor-id').value.trim();
    const doctorDetailsDiv = document.getElementById('doctor-details');
    const messageDiv = document.getElementById('doctor-message');

    doctorDetailsDiv.innerHTML = '';
    messageDiv.innerHTML = '';

    if (!id) {
        showMessage('doctor-message', '❌ Please enter a Doctor ID', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/${id}`);
        const doctor = await response.json();

        doctorDetailsDiv.innerHTML = `
            <div style="background: #f8f9fa; padding: 15px; border-radius: 5px;">
                <p><strong>ID:</strong> ${doctor.id}</p>
                <p><strong>Name:</strong> ${doctor.name}</p>
                <p><strong>Specialization:</strong> ${doctor.specialization}</p>
                <p><strong>Email:</strong> ${doctor.email}</p>
                <p><strong>Phone:</strong> ${doctor.phone || 'N/A'}</p>
                <p><strong>Department:</strong> ${doctor.departmentName || 'Not assigned'}</p>
            </div>
        `;

    } catch (error) {
        showMessage('doctor-message', `❌ ${error.message}`, 'error');
    }
}

// Update Doctor
async function updateDoctor(e) {
    e.preventDefault();
    const form = e.target;
    const id = document.getElementById('update-doctor-id').value.trim();
    const data = {
        name: form.name.value.trim(),
        specialization: form.specialization.value.trim(),
        email: form.email.value.trim(),
        phone: form.phone.value.trim()
    };

    try {
        const response = await fetch(`${API_BASE}/${id}`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok) {
            showMessage('update-doctor-message', `✅ Doctor ID ${result.id} updated successfully`, 'success');
        } else {
            throw new Error(result.error || 'Failed to update doctor');
        }

    } catch (error) {
        showMessage('update-doctor-message', `❌ ${error.message}`, 'error');
    }
}

// Delete Doctor
async function deleteDoctor(e) {
    e.preventDefault();
    const id = document.getElementById('delete-doctor-id').value.trim();

    try {
        const response = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });

        if (response.ok) {
            showMessage('delete-doctor-message', `✅ Doctor with ID ${id} deleted successfully`, 'success');
            document.getElementById('delete-doctor-form').reset();
        } else {
            throw new Error('Failed to delete doctor');
        }

    } catch (error) {
        showMessage('delete-doctor-message', `❌ ${error.message}`, 'error');
    }
}

// Utility function
function showMessage(elementId, message, type) {
    const element = document.getElementById(elementId);
    element.innerHTML = message;
    element.className = `message ${type}`;
}
