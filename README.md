# 🎓 E-Learning Platform (MERN Stack)

A full-stack **E-Learning Platform** built with **MongoDB, Express, React, Node.js (MERN)**.  
Students can enroll in courses, track progress, take quizzes, and download completion certificates. Teachers can create and manage courses and lessons.

---

## 🚀 Features

### Student
- Register and login
- Enroll & unenroll from courses
- Track course progress
- Take final quiz for each course
- Download PDF certificate upon completion

### Teacher
- Create & manage courses
- Add lessons to courses
- Assign quizzes to courses
- View enrolled students

### Admin / System
- Role-based access control (student, teacher, admin)
- JWT-protected API
- PDF certificate generation

---

## 🛠 Tech Stack

- **Frontend:** React, Tailwind CSS, Axios, React Router
- **Backend:** Node.js, Express, MongoDB, Mongoose
- **Authentication:** JWT
- **PDF Generation:** PDFKit

---

## 📁 Project Structure

Elearning/
├── client/ # React frontend
│ ├── public/ # Static assets (icons, images for UI)
│ └── src/
│ ├── api/
│ ├── components/
│ ├── pages/
│ └── App.jsx
│
├── server/ # Express backend
 ├── public/ # Certificate images (bg.png, logo.png, signature.png, seal.png)
 ├── models/
 ├── routes/
 ├── middleware/
 └── index.jx

 
---

## ⚙️ Installation & Setup

### 1️⃣ Clone the repository

```bash
git clone https://github.com/mamex7sl862/your-repo.git
cd Elearning

2️⃣ Backend Setup
cd server
npm install

Start backend server:

npm start


Runs on: http://localhost:3001

3️⃣ Frontend Setup
cd client
npm install
npm run dev


Runs on: http://localhost:5173

🔗 API Base URL
http://localhost:3001/api

📌 Key Endpoints
Method	Endpoint	Description
POST	/auth/login	User login
POST	/auth/register	User registration
GET	/courses	Get all courses
POST	/enrollments/complete/:courseId/:lessonId	Mark lesson complete
POST	/enrollments/quiz-passed/:courseId	Mark course completed
GET	/certificates/:courseId	Download PDF certificate
🧾 Certificate

PDF certificate generated via PDFKit

Includes: student name, course title, completion date, teacher signature, and seal

Assets must be in server/public/:

bg.png
logo.png
signature.png
seal.png


Only available after all lessons completed and quiz passed

🔐 Security

JWT-protected API

Role-based authorization

Passwords hashed

Server-side certificate generation

👨‍💻 Author

Mohammed Shifa
Ethiopia


