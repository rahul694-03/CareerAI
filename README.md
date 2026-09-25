# CareerAI

**CareerAI** is an AI-powered career platform designed specifically for college students, final-year undergraduates, and fresh graduates across all academic disciplines (Engineering, Computer Applications, Sciences, Commerce, Management, Arts, Nursing, Law, and more).

---

## 🚀 Tech Stack

### Frontend
- **Framework / Runtime:** React 19 + Vite 6
- **Language:** JavaScript (ESNext)
- **Styling:** Tailwind CSS v4
- **Routing:** React Router v7
- **HTTP Client:** Axios with JWT request/response interceptors
- **Icons:** Lucide React

### Backend
- **Framework:** Spring Boot 3.4.3
- **Language:** Java 21 / 26
- **Persistence:** Spring Data JPA / Hibernate
- **Security:** Spring Security + Stateless JWT (JJWT 0.12.6) + BCrypt password hashing
- **Build Tool:** Maven

### Database
- **Engine:** PostgreSQL 17

---

## 📁 Folder Structure

```
CareerAI/
├── frontend/
│   ├── src/
│   │   ├── assets/              # Static assets & illustrations
│   │   ├── components/          # Reusable UI components (CareerLogo, EmptyState, ProtectedRoute)
│   │   ├── context/             # AuthContext (state, token storage, user session)
│   │   ├── hooks/               # useAuth hook
│   │   ├── layouts/             # AppLayout (Sidebar + Mobile Drawer), AuthLayout
│   │   ├── pages/               # LandingPage, LoginPage, SignupPage, DashboardPage,
│   │   │                        # JobsPage, ApplicationsPage, InterviewPrepPage,
│   │   │                        # ResumePage, ProfilePage
│   │   ├── services/            # Axios instance (api.js), authService, userService
│   │   ├── utils/               # Constants (degrees, graduation years)
│   │   ├── App.jsx              # Main routing configuration
│   │   ├── index.css            # Tailwind CSS styling
│   │   └── main.jsx             # React entry point
│   ├── .env.example
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/careerai/
│   │   │   │   ├── config/      # Configuration classes
│   │   │   │   ├── controller/  # AuthController, UserController
│   │   │   │   ├── dto/         # RegisterRequest, LoginRequest, AuthResponse, UserDto, etc.
│   │   │   │   ├── entity/      # User JPA Entity
│   │   │   │   ├── exception/   # GlobalExceptionHandler, Custom exceptions
│   │   │   │   ├── repository/  # UserRepository
│   │   │   │   ├── security/    # JwtUtils, JwtAuthenticationFilter, SecurityConfig, UserDetailsService
│   │   │   │   ├── service/     # AuthService, UserService
│   │   │   │   └── CareerAiApplication.java
│   │   │   └── resources/
│   │   │       └── application.properties
│   │   └── test/
│   └── pom.xml
│
├── .gitignore
└── README.md
```

---

## ⚙️ Environment Variables

### Frontend (`frontend/.env`)

```properties
VITE_API_BASE_URL=http://localhost:8080
```

### Backend (`backend/src/main/resources/application.properties` or system environment variables)

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `DATABASE_URL` | `jdbc:postgresql://localhost:5432/careerai` | PostgreSQL JDBC connection string |
| `DATABASE_USERNAME` | `postgres` | PostgreSQL username |
| `DATABASE_PASSWORD` | `""` | PostgreSQL user password |
| `JWT_SECRET` | *(256-bit default provided in properties)* | Secret key used for signing JWT tokens |

---

## 🗄️ PostgreSQL Setup

1. Start your local PostgreSQL server (if not already running).
2. Create the `careerai` database:
   ```sql
   CREATE DATABASE careerai;
   ```
3. Hibernate automatically manages schema creation and updates (`spring.jpa.hibernate.ddl-auto=update`).

---

## 🛠️ Installation & Running

### 1. Backend (Spring Boot)

#### Prerequisites
- Java 21 or higher
- Apache Maven 3.8+
- PostgreSQL running on port 5432

#### Build & Run
```bash
cd backend
mvn clean package -DskipTests
java -jar target/careerai-backend-0.0.1-SNAPSHOT.jar
```
The REST API will be active on `http://localhost:8080`.

### 2. Frontend (React + Vite)

#### Prerequisites
- Node.js 18+ and npm

#### Install & Run
```bash
cd frontend
npm install
npm run dev
```
The frontend dev server will be accessible at `http://localhost:5173`.

---

## 🔐 Authentication & API Endpoints

### Public Endpoints
- `POST /api/auth/register` — Registers a student with Name, Email, Password, and optional Degree, College, and Graduation Year.
- `POST /api/auth/login` — Authenticates with Email and Password, returning a JWT token and user profile.

### Protected Endpoints (Requires `Authorization: Bearer <token>`)
- `GET /api/users/me` — Retrieves the authenticated student's profile.
- `PUT /api/users/me` — Updates the student's name, degree, college, and graduation year.

---

## 📱 Features Implemented in this Foundation Step

1. **Student Authentication System:**
   - Registration with support for diverse educational programs (B.Tech, BCA, B.Sc, B.Com, BBA, MBA, BA, Nursing, Law, etc.).
   - Secure login with BCrypt password hashing.
   - Stateless JWT authentication with automatic Axios token attachment and 401 interceptors.
2. **Student-First Landing Page:**
   - Modern startup SaaS design with clear value proposition.
   - 4-step workflow overview (Upload Resume, Find Jobs, Apply & Track, Prepare for Interviews).
3. **Student Dashboard:**
   - Clean, personalized greeting with student's name.
   - Real metric cards set to 0 (zero fake or mock numbers).
   - Direct CTAs to upload resume or explore jobs.
4. **Clean Non-Mocked Views:**
   - **Jobs:** Search box, filter tags (Internship, Full-time, Fresher, Remote, Hybrid, On-site), and genuine empty state without mock job cards.
   - **Applications:** Structured empty state without fake applications.
   - **Interview Prep:** Clean empty state without fabricated question sets.
   - **My Resume:** Resume upload interface ready for the parser phase.
   - **Profile:** Real-time view and edit capability for student details.
