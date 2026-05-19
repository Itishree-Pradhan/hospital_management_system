package com.hospital.hospital_management.service;

import com.hospital.hospital_management.model.Department;
import com.hospital.hospital_management.model.Doctor;
import com.hospital.hospital_management.repository.DepartmentRepository;
import com.hospital.hospital_management.repository.DoctorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DepartmentServiceImpl implements DepartmentService {

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Override
    public Department createDepartment(Department department) {
        if (department.getName() == null || department.getName().trim().isEmpty()) {
            throw new RuntimeException("Department name is required");
        }

        return departmentRepository.save(department);
    }

    @Override
    public Department getDepartmentById(Long id) {
        return departmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Department not found with id: " + id));
    }

    @Override
    public List<Department> getAllDepartments() {
        return departmentRepository.findAll();
    }

    @Override
    public List<Doctor> getDoctorsByDepartment(Long departmentId) {
        return null;
    }

    //@Override
    public List<Doctor> getDoctorsByDepartmentId(Long departmentId) {
        // First, verify the department exists
        if (!departmentRepository.existsById(departmentId)) {
            throw new RuntimeException("Department not found with id: " + departmentId);
        }

        // Then get doctors for that department
        return doctorRepository.findByDepartment_Id(departmentId);
    }
}