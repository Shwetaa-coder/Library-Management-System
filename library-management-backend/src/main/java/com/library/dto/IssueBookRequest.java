package com.library.dto;
import jakarta.validation.constraints.*;
import java.time.LocalDate;
public record IssueBookRequest(
    @NotNull(message="Book ID is required") Long bookId,
    @NotNull(message="Member ID is required") Long memberId,
    @NotNull(message="Due date is required") @FutureOrPresent(message="Due date cannot be in the past") LocalDate dueDate
) {}
