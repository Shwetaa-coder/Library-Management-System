package com.library.entity;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDate;
@Entity
@Table(name="loans")
@JsonIgnoreProperties({"hibernateLazyInitializer","handler"})
public class Loan {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch=FetchType.EAGER,optional=false) @JoinColumn(name="book_id",nullable=false) private Book book;
    @ManyToOne(fetch=FetchType.EAGER,optional=false) @JoinColumn(name="member_id",nullable=false) private Member member;
    @Column(nullable=false) private LocalDate issueDate;
    @Column(nullable=false) private LocalDate dueDate;
    private LocalDate returnDate;
    @Column(nullable=false) private String status="ISSUED";
    @Column(nullable=false) private Long fineAmount=0L;
    public Loan() {}
    @PrePersist public void setDefaults(){if(issueDate==null)issueDate=LocalDate.now();if(status==null)status="ISSUED";if(fineAmount==null)fineAmount=0L;}
    public Long getId(){return id;} public void setId(Long v){id=v;}
    public Book getBook(){return book;} public void setBook(Book v){book=v;}
    public Member getMember(){return member;} public void setMember(Member v){member=v;}
    public LocalDate getIssueDate(){return issueDate;} public void setIssueDate(LocalDate v){issueDate=v;}
    public LocalDate getDueDate(){return dueDate;} public void setDueDate(LocalDate v){dueDate=v;}
    public LocalDate getReturnDate(){return returnDate;} public void setReturnDate(LocalDate v){returnDate=v;}
    public String getStatus(){return status;} public void setStatus(String v){status=v;}
    public Long getFineAmount(){return fineAmount;} public void setFineAmount(Long v){fineAmount=v;}
}
