# Library Management System

A full-stack Library Management System built with React, Spring Boot, and PostgreSQL. The application helps manage books, members, book issuing, returns, overdue fines, and library activity through a user-friendly dashboard.

## Features

- Dashboard with library statistics
- Add, view, update, and delete books
- Add, view, update, and delete members
- Issue books to registered members
- Return issued books
- Automatic available-copy management
- Overdue fine calculation (₹10 per day)
- Input validation and error handling
- Persistent PostgreSQL database storage

## Tech Stack

**Frontend**
- React
- Vite
- JavaScript
- CSS

**Backend**
- Java
- Spring Boot
- Spring Data JPA
- Hibernate
- Maven

**Database**
- PostgreSQL

**Development Tools**
- IntelliJ IDEA
- pgAdmin
- Postman
- Git and GitHub

## Project Structure

```text
Library Management System/
│
├── library-frontend/
│   ├── src/
│   ├── package.json
│   └── ...
│
├── library-management-backend/
│   ├── src/
│   ├── pom.xml
│   └── ...
│
├── .gitignore
└── README.md
```

## Requirements

- JDK 21 (or the Java version specified in the backend project)
- Node.js and npm
- PostgreSQL
- IntelliJ IDEA or another suitable IDE

## Database Setup

1. Start PostgreSQL.
2. Create a database named `library_management`.
3. Configure your database credentials using environment variables:

```text
DB_URL=jdbc:postgresql://localhost:5432/library_management
DB_USERNAME=postgres
DB_PASSWORD=your_postgresql_password
```

Never commit actual database passwords or secrets to GitHub.

## Running the Backend

1. Open `library-management-backend` in IntelliJ.
2. Reload Maven dependencies.
3. Configure the database environment variables.
4. Run `com.library.LibraryManagementApplication`.

Backend API:

`http://localhost:8080`

## Running the Frontend

1. Open a terminal inside `library-frontend`.
2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

Open the local URL displayed in the terminal (usually `http://localhost:5173`).

## API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET / POST | `/api/books` | View and add books |
| PUT / DELETE | `/api/books/{id}` | Update and delete books |
| GET / POST | `/api/members` | View and add members |
| PUT / DELETE | `/api/members/{id}` | Update and delete members |
| GET | `/api/loans` | View loan records |
| POST | `/api/loans/issue` | Issue a book |
| POST | `/api/loans/{id}/return` | Return a book |
| GET | `/api/dashboard` | Dashboard statistics |

## Business Logic

- Available copies are automatically updated when books are issued and returned.
- Overdue fines are calculated at ₹10 per day when a book is returned.
- Books and members with borrowing history cannot be permanently deleted, preserving library records.

## Future Improvements

- User authentication and role-based access
- Search, filtering, and pagination
- Deployment to a cloud platform
- Automated backend and frontend tests

## Author

Developed as a full-stack software development project.