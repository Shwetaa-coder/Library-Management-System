# PageTurn — Library Management System

Full-stack library management application built with React, Vite, Java 21, Spring Boot 3.5.7, and PostgreSQL.

## Project folders
- `library-frontend/` — React + Vite interface
- `library-management-backend/` — Spring Boot REST API

## Run the application
1. Start PostgreSQL and create a database named `library_management`.
2. Open `library-management-backend` in IntelliJ and run `com.library.LibraryManagementApplication` with JDK 21. Configure `DB_USERNAME` and `DB_PASSWORD` if your local PostgreSQL credentials differ from the defaults in `application.properties`.
3. Open a terminal in `library-frontend` and run `npm install`.
4. Run `npm run dev` and open the local URL printed by Vite (normally `http://localhost:5173`).

The frontend expects the backend at `http://localhost:8080/api`. To change it, create a `.env` file in `library-frontend` with `VITE_API_BASE_URL=http://localhost:8080/api`.

## Main workflows
- Add, edit, search, and delete books.
- Register, edit, search, and delete members.
- Issue an available book to a member with a due date.
- Return an issued book; the available-copy count is restored and overdue fine is calculated at ₹10 per day.
- View dashboard totals and loan activity.

## Important rules
- A book cannot be issued when no copies are available.
- A book's available-copy count is maintained by the backend. Editing the total copy count preserves the number already issued.
- Books and members with borrowing history cannot be permanently deleted, preserving loan records.
- ISBNs and member email addresses must be unique.
