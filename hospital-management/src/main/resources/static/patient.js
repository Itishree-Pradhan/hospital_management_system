const BASE_URL = "https://hospital-management-system-ht9d.onrender.com/api";

// Global variables to store data
let departments = [];
let doctors = [];

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Initializing patient dashboard...');
    loadDepartmentsAndDoctors();
    setupEventListeners();
    setMinDate();
});

// Load both departments and doctors
async function loadDepartmentsAndDoctors() {
    try {
        console.log('🔄 Loading departments and doctors...');

        // Load departments
        const deptResponse = await fetch(`${BASE_URL}/departments`);
        if (!deptResponse.ok) throw new Error('Failed to load departments');
        departments = await deptResponse.json();
        console.log('📊 Departments loaded:', departments.length);

        // Load all doctors
        const docResponse = await fetch(`${BASE_URL}/doctors`);
        if (!docResponse.ok) throw new Error('Failed to load doctors');
        doctors = await docResponse.json();
        console.log('👨‍⚕️ Doctors loaded:', doctors.length);

        // Debug: Log all doctor-department relationships
        console.log('🔍 Doctor-Department Relationships:');
        doctors.forEach(doctor => {
            const deptName = doctor.department ? doctor.department.name : 'No Department';
            console.log(`   ${doctor.name} → ${deptName}`);
        });

        populateDepartmentDropdown();

    } catch (error) {
        console.error('❌ Error loading data:', error);
        document.getElementById('department').innerHTML = '<option value="">Error loading data</option>';
    }
}

// Populate department dropdown
function populateDepartmentDropdown() {
    const departmentSelect = document.getElementById('department');
    departmentSelect.innerHTML = '<option value="">Choose Department</option>';

    departments.forEach(dept => {
        const option = document.createElement('option');
        option.value = dept.id;
        option.textContent = dept.name;
        departmentSelect.appendChild(option);
    });

    console.log('✅ Department dropdown populated with', departments.length, 'departments');
}

// Setup event listeners
function setupEventListeners() {
    // Department change event
    document.getElementById('department').addEventListener('change', function() {
        const departmentId = parseInt(this.value);
        const departmentName = this.options[this.selectedIndex].text;
        console.log(`🎯 Department selected: ${departmentName} (ID: ${departmentId})`);

        if (departmentId) {
            filterDoctorsByDepartment(departmentId);
        } else {
            resetDoctorDropdown();
        }
    });

    // Form submission
    document.getElementById('book-appointment-form').addEventListener('submit', bookAppointment);
}

// Filter doctors by department
function filterDoctorsByDepartment(departmentId) {
    const doctorSelect = document.getElementById('doctor');

    console.log(`🔍 Filtering doctors for department ID: ${departmentId}`);

    // Filter doctors for the selected department
    const filteredDoctors = doctors.filter(doctor => {
        const hasDepartment = doctor.department && doctor.department.id === departmentId;
        if (hasDepartment) {
            console.log(`   ✅ ${doctor.name} - ${doctor.specialization}`);
        }
        return hasDepartment;
    });

    console.log(`📊 Found ${filteredDoctors.length} doctors for department ${departmentId}`);

    if (filteredDoctors.length === 0) {
        doctorSelect.innerHTML = '<option value="">No doctors available in this department</option>';
        console.log('⚠️ No doctors found for this department');
    } else {
        populateDoctorDropdown(filteredDoctors);
    }

    doctorSelect.disabled = false;
}

// Populate doctor dropdown
function populateDoctorDropdown(doctorsList) {
    const doctorSelect = document.getElementById('doctor');
    doctorSelect.innerHTML = '<option value="">Choose Doctor</option>';

    doctorsList.forEach(doctor => {
        const option = document.createElement('option');
        option.value = doctor.id;
        option.textContent = `${doctor.name} - ${doctor.specialization}`;
        doctorSelect.appendChild(option);
    });

    console.log(`✅ Populated ${doctorsList.length} doctors in dropdown`);
}

// Reset doctor dropdown
function resetDoctorDropdown() {
    const doctorSelect = document.getElementById('doctor');
    doctorSelect.innerHTML = '<option value="">Please select department first</option>';
    doctorSelect.disabled = true;
}

// Book appointment function
async function bookAppointment(event) {
    event.preventDefault();

    const form = event.target;
    const formData = new FormData(form);

    // ✅ Flat fields matching AppointmentRequestDTO exactly
    const appointmentData = {
        patientName: formData.get('patientName'),
        patientEmail: formData.get('patientEmail'),
        patientPhone: formData.get('patientPhone'),
        doctorId: parseInt(formData.get('doctor')),
        departmentId: parseInt(formData.get('department')),
        appointmentDate: formData.get('appointmentDate'),   // "2026-05-29" format ✅
        appointmentTime: formData.get('appointmentTime'),   // "11:30" format ✅
        status: 'BOOKED'
    };

    console.log('📤 Sending:', appointmentData);

    try {
        const response = await fetch(`${BASE_URL}/appointments/book`, {  // ✅ correct URL
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(appointmentData)
        });

        const result = await response.json();

        if (response.ok && result.success) {
            showMessage('✅ Appointment booked successfully!', 'success');
            form.reset();
            resetDoctorDropdown();
            document.getElementById('department').selectedIndex = 0;
        } else {
            throw new Error(result.error || 'Failed to book appointment');
        }
    } catch (error) {
        console.error('❌ Error:', error);
        showMessage('❌ Error: ' + error.message, 'error');
    }
}

// Show message function
function showMessage(message, type) {
    const messageDiv = document.getElementById('appointment-message');
    messageDiv.textContent = message;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'block';

    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 5000);
}

// Set minimum date to today
function setMinDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('appointment-date').setAttribute('min', today);
}
