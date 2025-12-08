package learning.example.supabase.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import learning.example.supabase.DTOs.AccountResponse;
import learning.example.supabase.DTOs.TodoRequest;
import learning.example.supabase.DTOs.TodoResponse;
import learning.example.supabase.service.serviceImpl.TodoServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/todos")
public class TodoController {

    private final TodoServiceImpl service;

    @Autowired
    public TodoController(TodoServiceImpl service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<TodoResponse> create(@RequestBody TodoRequest request) {
        Long userId = getCurrentUserId();
        request.setAccountId(userId);

        TodoResponse todo = service.createTodo(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(todo);
    }

    @GetMapping
    public ResponseEntity<List<TodoResponse>> getAll() {
        List<TodoResponse> todos = service.getAllTodos();
        return ResponseEntity.ok(todos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TodoResponse> getById(@PathVariable Long id) {
        TodoResponse todo = service.getById(id);
        return ResponseEntity.ok(todo);
    }

    @GetMapping("/my")
    public ResponseEntity<List<TodoResponse>> getMyTodos() {
        try {
            Long userId = getCurrentUserId();
            System.out.println("Getting todos for user ID: " + userId);

            List<TodoResponse> todos = service.getTodoByAccountId(userId);
            return ResponseEntity.ok(todos);

        } catch (Exception e) {
            System.out.println("Error in getMyTodos: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/account/{accountId}")
    public ResponseEntity<List<TodoResponse>> getByAccount(@PathVariable Long accountId) {
        List<TodoResponse> todos = service.getTodoByAccountId(accountId);
        return ResponseEntity.ok(todos);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<TodoResponse> update(@PathVariable Long id, @RequestBody TodoRequest request) {
        TodoResponse updated = service.update(id, request);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    // Helper method to get current user ID from JWT
    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getDetails() instanceof Long) {
            return (Long) authentication.getDetails();
        }
        throw new RuntimeException("User not authenticated");
    }
}

