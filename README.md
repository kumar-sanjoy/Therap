# Flow AI

A comprehensive educational web application that empowers students to register, log in, and enhance their learning experience.

## Features
1. Take interactive tests based on school textbooks.
2. Track progress and learn lessons directly from textbooks.
3. Practice MCQs based on previous mistakes.
4. Practice written questions, with answers judged against the textbook.
5. Ask doubts in real time using images and voice.
6. Generate notes for download, including PDF format.
7. Invite friends to attend a challenge exam, with a leaderboard available.


🌐 **Live Demo:** [https://flowai-beta.vercel.app/](https://flowai-beta.vercel.app/)  
📂 **Frontend Dedicated Repository:** [https://github.com/WasicAlavi/Flow-ai](https://github.com/WasicAlavi/Flow-ai)

## 🚀 Tech Stack

- **Frontend:** React with Vite
- **Backend:** Spring Boot (primary), Flask (secondary)
- **Authentication:** JWT (JSON Web Token)
- **Database:** PostgreSQL
- **Deployment:** Docker

## ✨ Features

- **User Authentication** - Secure signup, login, and logout functionality
- **Personalized Exams** - Tailored tests for individual students based on their learning progress
- **Progress Tracking** - Monitor student performance and learning outcomes
- **Textbook Integration** - Interactive lessons directly from school textbooks
- **Real-time Doubt Resolution** - Ask questions with image and voice support in real-time
- **Note Generation** - Generate and download study notes, available in PDF format
- **CRUD Operations** - Complete task management system
- **Responsive Design** - Optimized for all device sizes
- **REST API** - Clean JSON-based API responses

## 📦 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- Docker & Docker Compose
- PostgreSQL

### Frontend Setup
```bash
# Clone the repository
git clone https://github.com/kumarsanjoy/Therap.git

# Navigate to frontend directory
cd Therap/frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

### Backend Setup
The backend uses a microservices architecture and is containerized using Docker. The project includes multiple services orchestrated through Docker Compose.

1. **Configuration**  
   Edit the environment variables in the `docker-compose.yml` file located in the root directory with your specific configuration values before running the application.

2. ### Configuration Setup
Before running the application, you need to update the environment variables in the `docker-compose.yml` file according to your setup:

**Required Configuration Variables:**
```yaml
# Database Configuration
SPRING_DATASOURCE_URL: your_database_url
SPRING_DATASOURCE_USERNAME: your_db_username
SPRING_DATASOURCE_PASSWORD: your_db_password

# JWT Configuration
JWT_SECRET: your_jwt_secret_key
JWT_EXPIRATION: your_jwt_expiration_time

# Application Configuration
FRONTEND_URL: your_frontend_url_to_allow_CORS
GOOGLE_API_KEY: your_google_api_key

# Database Connection Pool Settings (adjust based on your database capacity)
SPRING_DATASOURCE_HIKARI_MAXIMUM_POOL_SIZE: 6 (recommended)
SPRING_DATASOURCE_HIKARI_MINIMUM_IDLE: 2 (recommended)
SPRING_DATASOURCE_HIKARI_IDLE_TIMEOUT: 20000 (recommended)

# Server Configuration
SERVER_TOMCAT_THREADS_MAX: 200
```

3. **Start All Services**
```bash
# Navigate to the root directory
cd Therap

# Build and run all services using Docker Compose
docker-compose up --build
```

This will start the following services:
- **API Gateway** (Port 8080) - Main entry point for all requests
- **Auth Service** (Port 8090) - Handles user authentication
- **Exam Service** (Port 8091) - Manages tests and examinations
- **Learning Service** (Port 8092) - Handles textbook content and lessons
- **Profile Service** (Port 8093) - Manages user profiles and progress
- **Python Server** (Port 5000) - Necessary for AI-powered features (exam, notes, lesson, challenge-exam)


**Services Architecture:**
- Microservices-based backend with Spring Boot
- API Gateway for routing requests (Port 8080)
- Dedicated services for authentication, exams, learning, and profiles
- Python service for AI-powered features and note generation

## 🎯 Usage

1. Visit the [live application](https://flowai-beta.vercel.app/)
2. Create a new account or log in with existing credentials
3. Browse available textbook lessons and interactive content
4. Take personalized tests tailored to your learning progress
5. Ask questions with image and voice support for real-time doubt resolution
6. Generate and download study notes in PDF format
7. Monitor your learning journey through the comprehensive dashboard


---

Built with ❤️ for better education
