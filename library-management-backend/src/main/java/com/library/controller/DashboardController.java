package com.library.controller;
import com.library.service.LibraryService;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
@RestController @RequestMapping("/api/dashboard")
public class DashboardController {
    private final LibraryService service;
    public DashboardController(LibraryService service){this.service=service;}
    @GetMapping public Map<String,Long> stats(){return service.getDashboardStats();}
}
