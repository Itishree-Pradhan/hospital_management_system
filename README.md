# 🏥 Hospital Management System

A full-stack web application for managing hospital operations including patient appointment booking, doctor management, and department administration.


---

## 📌 Features

- **Appointment Booking** — Patients can book appointments by selecting department, doctor, date and time
- **Department Management** — 11 medical departments pre-loaded (Cardiology, Neurology, Pediatrics, etc.)
- **Doctor Directory** — Doctor-department mapping with specialization filtering
- **Admin Dashboard** — Manage all appointments, doctors, and departments
- **Auto Data Seeding** — DataLoader auto-populates departments and doctors on first run
- **REST API** — Clean RESTful endpoints for all operations

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Java 17, Spring Boot 3.2 |
| ORM | Spring Data JPA, Hibernate |
| Database | MySQL 8.0 |
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Auth | Session Storage (frontend demo auth) |
| Build Tool | Maven |

---

## 🚀 Getting Started

### Prerequisites

- Java 17+
- MySQL 8.0+
- Maven 3.8+

## 🔗 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/appointments/book` | Book a new appointment |
| `GET` | `/api/appointments` | Get all appointments |
| `GET` | `/api/appointments/{id}` | Get appointment by ID |
| `PUT` | `/api/appointments/{id}` | Update appointment |
| `DELETE` | `/api/appointments/{id}` | Cancel appointment |
| `GET` | `/api/doctors` | Get all doctors |
| `GET` | `/api/doctors/{id}` | Get doctor by ID |
| `GET` | `/api/doctors/department/{id}` | Get doctors by department |
| `POST` | `/api/doctors` | Add new doctor |
| `PUT` | `/api/doctors/{id}` | Update doctor |
| `DELETE` | `/api/doctors/{id}` | Delete doctor |
| `GET` | `/api/departments` | Get all departments |

---

## 🏥 Pre-loaded Data

**Departments (11):**
Cardiology, Neurology, Pediatrics, Orthopedics, Gynecology, Oncology, Dermatology, Urology, Gastroenterology, Hematology, Others

One specialist doctor is seeded per department automatically on first run.

---

## 🔐 Admin Login

| Email | Password |
|-------|----------|
| `admin.sambit@hospital.com` | `adminpass` |

> **Note:** Admin authentication is frontend session-based for demo purposes. Production deployment would use Spring Security + JWT.

---

## 🐛 Known Bugs Fixed

- `@JsonIgnore` on `getDepartment()` was hiding department data in API response, breaking the doctor filter — fixed with `@JsonIgnoreProperties`
- JS appointment payload was sending nested objects while `AppointmentRequestDTO` expected flat fields — corrected request body structure
- Appointment booking was POSTing to wrong endpoint `/api/appointments` instead of `/api/appointments/book`

---
## 👨‍💻 Author

**Sambit Kumar Panda**
MCA — Indira Gandhi Institute of Technology, Sarang
GitHub: https://github.com/SambitKumarMohapatra

---
