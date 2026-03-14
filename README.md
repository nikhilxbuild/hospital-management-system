# 🏥 Hospital Management System

A modern **Hospital Management System (HMS)** designed to help clinics and hospitals manage patients, doctors, appointments, medical records, prescriptions, and billing efficiently.

The system provides a **patient portal** where patients can book appointments, view medical history, prescriptions, and bills, and an **admin dashboard** where hospital staff manage doctors, appointments, and patient records.

This project demonstrates the design of a real-world healthcare management platform built with modern web technologies.

---

# 🚀 Features

## 👤 Patient Portal
- Secure patient registration and login
- Book appointments with available doctors
- View appointment history
- Access medical history and diagnosis records
- View prescribed medicines from previous consultations
- Track consultation bills and payment history

## 👨‍⚕️ Doctor Management
- Add and manage doctors
- Store specialization and experience details
- Set daily appointment limits
- Manage doctor schedules

## 📅 Appointment System
- Online appointment booking
- Automatic token number generation
- Prevent overbooking with daily limits
- Appointment status tracking (Booked / Completed / Cancelled)
- Manual appointment creation for walk-in patients

## 🩺 Visit Records
- Record diagnosis notes for each consultation
- Store medical visit history
- Track follow-up visit dates

## 💊 Prescription Management
- Add prescriptions after consultation
- Store medicines, dosage, and instructions
- Patients can view prescription history

## 💳 Billing System
- Generate consultation bills
- Store billing records for each visit
- Patients can view billing history

## 🧑‍💼 Admin Dashboard
- Manage doctors, patients, and appointments
- View patient records
- Track hospital activities from a centralized dashboard

## 🔔 Notifications
- Appointment confirmation messages
- Token number assignment
- Consultation completion updates

---

# ⭐ Key Capabilities

- Patient medical history tracking
- Digital prescription management
- Appointment scheduling automation
- Doctor schedule management
- Billing and consultation record tracking
- Centralized hospital administration dashboard

---

# 🧱 System Architecture

The frontend communicates with Supabase APIs for authentication and data operations while PostgreSQL stores all hospital records.

---

# 🗄 Database Structure

Core tables used in the system:

- patients
- doctors
- appointments
- visits
- prescriptions
- billing
- notifications
- admin_users

---

# 🔗 Relationship Overview

This structure ensures that every consultation is linked to patient records, prescriptions, and billing information.

---

# ⚙️ Tech Stack

| Technology | Purpose |
|-----------|--------|
| React | Frontend framework |
| Vite | Development environment |
| TypeScript | Type-safe JavaScript |
| Tailwind CSS | UI styling |
| shadcn-ui | UI components |
| Supabase | Backend services and APIs |
| PostgreSQL | Database |

---

## 👨‍💻 Author

**Nikhil Sinha**  
Web Developer & Product Builder  

Portfolio: https://nikhilsinha.in

---

## 📄 License

This project is licensed under the **MIT License**.

Copyright (c) 2026 Nikhil Sinha

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files to deal in the Software
without restriction, including without limitation the rights to use, copy,
modify, merge, publish, distribute, sublicense, and/or sell copies of the
Software.

---

# 💻 Installation

Clone the repository:

```bash
git clone <YOUR_GIT_URL>
cd <PROJECT_NAME>
npm install
npm run dev

