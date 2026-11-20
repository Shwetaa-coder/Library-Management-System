package com.library.service;
import com.library.dto.IssueBookRequest;
import com.library.entity.*;
import com.library.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.*;
import java.time.temporal.ChronoUnit;
import java.util.*;
@Service
public class LibraryService {
    private static final long FINE_PER_DAY=10L;
    private final BookRepository books;
    private final MemberRepository members;
    private final LoanRepository loans;
    public LibraryService(BookRepository books,MemberRepository members,LoanRepository loans){
        this.books=books;this.members=members;this.loans=loans;
    }
    @Transactional(readOnly=true) public List<Book> getAllBooks(){return books.findAll();}
    public Book addBook(Book book){
        if (book.getAvailableCopies() == null) {
            book.setAvailableCopies(book.getTotalCopies());
        }
        validateCopies(book);
        if(books.existsByIsbn(book.getIsbn())) throw new IllegalArgumentException("ISBN already exists");
        return books.save(book);
    }
    public Book updateBook(Long id,Book input){
        Book book=books.findById(id).orElseThrow(()->new IllegalArgumentException("Book not found"));
        if(books.existsByIsbnAndIdNot(input.getIsbn(),id)) throw new IllegalArgumentException("ISBN already exists");
        int issued=book.getTotalCopies()-book.getAvailableCopies();
        if(input.getTotalCopies()==null||input.getTotalCopies()<issued)
            throw new IllegalArgumentException("Total copies cannot be less than currently issued copies");
        book.setTitle(input.getTitle());book.setAuthor(input.getAuthor());book.setIsbn(input.getIsbn());
        book.setCategory(input.getCategory());book.setPublishedYear(input.getPublishedYear());
        book.setTotalCopies(input.getTotalCopies());book.setAvailableCopies(input.getTotalCopies()-issued);
        validateCopies(book);return books.save(book);
    }
    public void deleteBook(Long id){
        Book book=books.findById(id).orElseThrow(()->new IllegalArgumentException("Book not found"));
        if(loans.existsByBook_Id(id)) throw new IllegalArgumentException("Cannot delete a book with borrowing history");
        books.delete(book);
    }
    private void validateCopies(Book b){
        if (b.getTotalCopies() == null || b.getTotalCopies() < 1) {
            throw new IllegalArgumentException("Total copies must be at least 1");
        }
        if (b.getAvailableCopies() == null || b.getAvailableCopies() < 0
                || b.getAvailableCopies() > b.getTotalCopies()) {
            throw new IllegalArgumentException("Available copies must be between 0 and total copies");
        }
    }
    @Transactional(readOnly=true) public List<Member> getAllMembers(){return members.findAll();}
    public Member addMember(Member member){
        if(members.existsByEmail(member.getEmail())) throw new IllegalArgumentException("Email already registered");
        return members.save(member);
    }
    public Member updateMember(Long id,Member input){
        Member m=members.findById(id).orElseThrow(()->new IllegalArgumentException("Member not found"));
        if(members.existsByEmailAndIdNot(input.getEmail(),id)) throw new IllegalArgumentException("Email already registered");
        m.setFullName(input.getFullName());m.setEmail(input.getEmail());m.setPhone(input.getPhone());m.setAddress(input.getAddress());
        return members.save(m);
    }
    public void deleteMember(Long id){
        Member m=members.findById(id).orElseThrow(()->new IllegalArgumentException("Member not found"));
        if(loans.existsByMember_Id(id)) throw new IllegalArgumentException("Cannot delete a member with borrowing history");
        members.delete(m);
    }
    @Transactional(readOnly=true) public List<Loan> getAllLoans(){return loans.findAll();}
    @Transactional public Loan issueBook(IssueBookRequest req){
        Book book=books.findById(req.bookId()).orElseThrow(()->new IllegalArgumentException("Book not found"));
        Member member=members.findById(req.memberId()).orElseThrow(()->new IllegalArgumentException("Member not found"));
        if(req.dueDate().isBefore(LocalDate.now())) throw new IllegalArgumentException("Due date cannot be in the past");
        if(book.getAvailableCopies()<=0) throw new IllegalArgumentException("No copies available for this book");
        book.setAvailableCopies(book.getAvailableCopies()-1);books.save(book);
        Loan loan=new Loan();loan.setBook(book);loan.setMember(member);loan.setIssueDate(LocalDate.now());
        loan.setDueDate(req.dueDate());loan.setStatus("ISSUED");loan.setFineAmount(0L);
        return loans.save(loan);
    }
    @Transactional public Loan returnBook(Long id){
        Loan loan=loans.findById(id).orElseThrow(()->new IllegalArgumentException("Loan not found"));
        if("RETURNED".equals(loan.getStatus())) throw new IllegalArgumentException("This book has already been returned");
        LocalDate today=LocalDate.now();
        long lateDays=Math.max(0,ChronoUnit.DAYS.between(loan.getDueDate(),today));
        loan.setFineAmount(lateDays*FINE_PER_DAY);loan.setReturnDate(today);loan.setStatus("RETURNED");
        Book book=loan.getBook();book.setAvailableCopies(book.getAvailableCopies()+1);books.save(book);
        return loans.save(loan);
    }
    @Transactional(readOnly=true) public Map<String,Long> getDashboardStats(){
        return Map.of("totalBooks",books.count(),"totalMembers",members.count(),
            "issuedBooks",loans.countByStatus("ISSUED"),
            "overdueBooks",loans.countByStatusAndDueDateBefore("ISSUED",LocalDate.now()));
    }
}
