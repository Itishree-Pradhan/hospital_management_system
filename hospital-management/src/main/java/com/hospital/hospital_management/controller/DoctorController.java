package com.hospital.hospital_management.controller;

import com.hospital.hospital_management.model.Doctor;
import com.hospital.hospital_management.model.Department;
import com.hospital.hospital_management.repository.DoctorRepository;
import com.hospital.hospital_management.repository.DepartmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/doctors")
public class DoctorController {

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    // GET all doctors
    @GetMapping
    public List<Doctor> getAllDoctors() {
        return doctorRepository.findAll();
    }

    // GET doctor by ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getDoctorById(@PathVariable Long id) {
        Optional<Doctor> doctor = doctorRepository.findById(id);
        if (doctor.isPresent()) {
            return ResponseEntity.ok(doctor.get());
        }
        return ResponseEntity.notFound().build();
    }

    // POST create new doctor
    @PostMapping
    public ResponseEntity<?> createDoctor(@RequestBody Doctor doctor) {
        try {
            // Validate department exists
            if (doctor.getDepartment() != null && doctor.getDepartment().getId() != null) {
                Optional<Department> dept = departmentRepository.findById(doctor.getDepartment().getId());
                if (!dept.isPresent()) {
                    return ResponseEntity.badRequest()
                            .body(Map.of("error", "Department not found with id: " + doctor.getDepartment().getId()));
                }
                doctor.setDepartment(dept.get());
            }

            Doctor savedDoctor = doctorRepository.save(doctor);
            return ResponseEntity.ok(savedDoctor);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Failed to create doctor: " + e.getMessage()));
        }
    }

    // PUT update doctor
    @PutMapping("/{id}")
    public ResponseEntity<?> updateDoctor(@PathVariable Long id, @RequestBody Doctor doctorDetails) {
        try {
            Optional<Doctor> doctorOptional = doctorRepository.findById(id);
            if (!doctorOptional.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            Doctor doctor = doctorOptional.get();
            doctor.setName(doctorDetails.getName());
            doctor.setSpecialization(doctorDetails.getSpecialization());
            doctor.setEmail(doctorDetails.getEmail());
            doctor.setPhone(doctorDetails.getPhone());

            // Update department if provided
            if (doctorDetails.getDepartment() != null && doctorDetails.getDepartment().getId() != null) {
                Optional<Department> dept = departmentRepository.findById(doctorDetails.getDepartment().getId());
                if (dept.isPresent()) {
                    doctor.setDepartment(dept.get());
                }
            }

            Doctor updatedDoctor = doctorRepository.save(doctor);
            return ResponseEntity.ok(updatedDoctor);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Failed to update doctor: " + e.getMessage()));
        }
    }

    // DELETE doctor
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDoctor(@PathVariable Long id) {
        try {
            if (doctorRepository.existsById(id)) {
                doctorRepository.deleteById(id);
                return ResponseEntity.ok(Map.of("message", "Doctor deleted successfully"));
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Failed to delete doctor: " + e.getMessage()));
        }
    }

    // GET doctors by department
    @GetMapping("/department/{departmentId}")
    public ResponseEntity<?> getDoctorsByDepartment(@PathVariable Long departmentId) {
        try {
            Optional<Department> department = departmentRepository.findById(departmentId);
            if (!department.isPresent()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Department not found"));
            }

            List<Doctor> doctors = doctorRepository.findByDepartment_Id(departmentId);
            return ResponseEntity.ok(doctors);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Failed to get doctors: " + e.getMessage()));
        }
    }
}