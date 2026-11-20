package com.library.exception;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.*;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import java.util.*;
import java.util.stream.Collectors;
@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String,String>> badRequest(IllegalArgumentException ex){return body(HttpStatus.BAD_REQUEST,ex.getMessage());}
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String,String>> validation(MethodArgumentNotValidException ex){
        String msg=ex.getBindingResult().getFieldErrors().stream()
            .map(e->e.getField()+": "+e.getDefaultMessage()).collect(Collectors.joining("; "));
        return body(HttpStatus.BAD_REQUEST,msg);
    }
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String,String>> conflict(DataIntegrityViolationException ex){
        return body(HttpStatus.CONFLICT,"This record conflicts with existing database data. Check unique fields and related records.");
    }
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String,String>> other(Exception ex){
        return body(HttpStatus.INTERNAL_SERVER_ERROR,"An unexpected server error occurred.");
    }
    private ResponseEntity<Map<String,String>> body(HttpStatus status,String message){
        Map<String,String> result=new LinkedHashMap<>(); result.put("status",status.name());
        result.put("message",message==null?"Request failed":message); return ResponseEntity.status(status).body(result);
    }
}
