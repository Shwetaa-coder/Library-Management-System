# Library Management System — Frontend

React + Vite frontend for the Spring Boot API.

## Run
1. Start PostgreSQL and your Spring Boot backend on `http://localhost:8080`.
2. Open this folder in a terminal.
3. Run `npm install`
4. Run `npm run dev`
5. Open the local URL printed by Vite (normally http://localhost:5173).

The API base defaults to `http://localhost:8080/api`. To change it, create `.env` in this folder with:

`VITE_API_BASE_URL=http://localhost:8080/api`

## Expected endpoints
- GET/POST `/api/books`; PUT/DELETE `/api/books/{id}`
- GET/POST `/api/members`; PUT/DELETE `/api/members/{id}`
- GET `/api/loans`; POST `/api/loans/issue` with `{ "bookId": 1, "memberId": 1, "dueDate": "YYYY-MM-DD" }`
- POST `/api/loans/{id}/return`
- GET `/api/dashboard`

The UI supports dashboard, book CRUD, member CRUD, issuing books, and returns. If your backend uses different JSON property names, adjust `src/App.jsx` to match its entity fields.
