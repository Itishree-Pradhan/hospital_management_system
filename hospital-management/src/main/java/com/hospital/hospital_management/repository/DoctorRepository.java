package com.hospital.hospital_management.repository;

import com.hospital.hospital_management.model.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Long> {
    List<Doctor> findByDepartment_Id(Long departmentId);
    List<Doctor> findBySpecialization(String specialization);
    List<Doctor> findByNameContainingIgnoreCase(String name);
}