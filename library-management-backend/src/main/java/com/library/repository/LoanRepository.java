package com.library.repository;
import com.library.entity.Loan;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
public interface LoanRepository extends JpaRepository<Loan,Long> {
    long countByStatus(String status);
    long countByStatusAndDueDateBefore(String status,LocalDate date);
    boolean existsByBook_Id(Long bookId);
    boolean existsByMember_Id(Long memberId);
}
