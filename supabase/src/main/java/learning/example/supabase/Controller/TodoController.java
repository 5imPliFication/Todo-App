package learning.example.supabase.Controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import learning.example.supabase.DTOs.AccountResponse;
import learning.example.supabase.DTOs.TodoRequest;
import learning.example.supabase.DTOs.TodoResponse;
import learning.example.supabase.Service.ServiceImpl.TodoServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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
    public TodoResponse create(HttpServletRequest request, @RequestBody TodoRequest todoRequest) {
        HttpSession session = request.getSession(false);

        if (session == null || session.getAttribute("account") == null) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        }

        AccountResponse acc = (AccountResponse) session.getAttribute("account");

        return service.createTodo(todoRequest, acc.getId());
    }


    @GetMapping()
    public List<TodoResponse> getAll() {
        return service.getAllTodos();
    }

    @GetMapping("/{id}") // Add this - get single todo
    public ResponseEntity<TodoResponse> getById(@PathVariable Long id) {
        TodoResponse todo = service.getById(id);
        return ResponseEntity.ok(todo);
    }

    @PatchMapping("/{id}")
    public TodoResponse update(@PathVariable Long id, @RequestBody TodoRequest request) {
        return service.update(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build(); // 204 No Content is proper for delete
    }

    @GetMapping("/my") // Renamed path variable for clarity
    public List<TodoResponse> getByAccount(HttpServletRequest request) {
        HttpSession session = request.getSession(false);

        if (session == null || session.getAttribute("account") == null) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        }

        AccountResponse acc = (AccountResponse) session.getAttribute("account");

        return service.getTodoByAccountId(acc.getId());
    }
}

