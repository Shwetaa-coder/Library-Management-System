package com.library.entity;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
@Entity
@Table(name="books", uniqueConstraints=@UniqueConstraint(columnNames="isbn"))
public class Book {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @NotBlank(message="Book title is required") @Size(max=150) @Column(nullable=false, length=150) private String title;
    @NotBlank(message="Author name is required") @Size(max=100) @Column(nullable=false, length=100) private String author;
    @NotBlank(message="ISBN is required") @Column(nullable=false, unique=true) private String isbn;
    @NotBlank(message="Category is required") @Column(nullable=false) private String category;
    @NotNull(message="Total copies are required") @Min(value=1,message="Total copies must be at least 1") @Column(nullable=false) private Integer totalCopies;
    @Min(value=0,message="Available copies cannot be negative") @Column(nullable=false) private Integer availableCopies;
    @Min(value=0,message="Published year cannot be negative") private Integer publishedYear;
    public Book() {}
    public Long getId(){return id;} public void setId(Long v){id=v;}
    public String getTitle(){return title;} public void setTitle(String v){title=v;}
    public String getAuthor(){return author;} public void setAuthor(String v){author=v;}
    public String getIsbn(){return isbn;} public void setIsbn(String v){isbn=v;}
    public String getCategory(){return category;} public void setCategory(String v){category=v;}
    public Integer getTotalCopies(){return totalCopies;} public void setTotalCopies(Integer v){totalCopies=v;}
    public Integer getAvailableCopies(){return availableCopies;} public void setAvailableCopies(Integer v){availableCopies=v;}
    public Integer getPublishedYear(){return publishedYear;} public void setPublishedYear(Integer v){publishedYear=v;}
}
