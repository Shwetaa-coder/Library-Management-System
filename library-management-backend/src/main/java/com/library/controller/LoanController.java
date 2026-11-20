package com.library.controller;
import com.library.dto.IssueBookRequest;
import com.library.entity.Loan;
import com.library.service.LibraryService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController @RequestMapping("/api/loans")
public class LoanController {
    private final LibraryService service;
    public LoanController(LibraryService service){this.service=service;}
    @GetMapping public List<Loan> all(){return service.getAllLoans();}
    @PostMapping("/issue") @ResponseStatus(HttpStatus.CREATED) public Loan issue(@Valid @RequestBody IssueBookRequest request){return service.issueBook(request);}
    @PostMapping("/{id}/return") public Loan returnBook(@PathVariable Long id){return service.returnBook(id);}
}
