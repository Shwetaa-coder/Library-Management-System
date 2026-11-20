package com.library.controller;
import com.library.entity.Book;
import com.library.service.LibraryService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController @RequestMapping("/api/books")
public class BookController {
    private final LibraryService service;
    public BookController(LibraryService service){this.service=service;}
    @GetMapping public List<Book> all(){return service.getAllBooks();}
    @PostMapping @ResponseStatus(HttpStatus.CREATED) public Book add(@Valid @RequestBody Book book){return service.addBook(book);}
    @PutMapping("/{id}") public Book update(@PathVariable Long id,@Valid @RequestBody Book book){return service.updateBook(id,book);}
    @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) public void delete(@PathVariable Long id){service.deleteBook(id);}
}
