# Manual end-to-end test checklist

Run PostgreSQL, the Spring Boot backend, and the Vite frontend before testing.

## Start the application

1. Make sure PostgreSQL is running and the `library_management` database exists.
2. Run `LibraryManagementApplication` from IntelliJ (JDK 21). The API should be available at `http://localhost:8080`.
3. In a terminal opened in `library-frontend`, run `npm install` and then `npm run dev`.
4. Open the Vite URL (normally `http://localhost:5173`). The sidebar should say **Backend connected**.

## Test the main workflows

1. **Add a book:** open Books → Add book. Enter a title, author, unique ISBN, category, and total copies (for example, 2). Save. The new book should appear with `2 / 2` copies.
2. **Edit a book:** edit its title or author and save. The change should appear, and the available-copy count should remain correct.
3. **Add a member:** open Members → Add member. Enter a full name and a valid, unused email. Save. The member should appear with the correct name and email.
4. **Edit a member:** change the name or phone and save. The updated values should appear.
5. **Issue a book:** open Borrow & Return → Issue a book. Select the book and member, choose today or a future due date, and save. A loan should appear as Issued, and available copies should decrease by one.
6. **Prevent over-issuing:** try issuing the same book after its available count reaches zero. The UI will disable that book in the selector; the backend also rejects an issue request when no copies remain.
7. **Return a book:** select Return on an issued loan and confirm. The loan should show Returned, and the book's available-copy count should increase by one.
8. **Delete unused records:** add a temporary book/member that has never been involved in a loan, then delete it. It should disappear from the relevant list.
9. **Validation:** try a duplicate ISBN or duplicate member email. The backend should reject the duplicate and the UI should display an error instead of silently adding another record.

## Important deletion rule

A book or member that has loan history cannot be permanently deleted. This is intentional: deleting it would break the historical loan record. Delete test records that have never been borrowed/issued.

## Build check

From `library-frontend`, run `npm run build`. From `library-management-backend`, run `mvn test` (or use the Maven tool window in IntelliJ).
