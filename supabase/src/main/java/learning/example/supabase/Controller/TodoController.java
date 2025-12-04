package learning.example.supabase.Controller;

import learning.example.supabase.DTOs.TodoRequest;
import learning.example.supabase.DTOs.TodoResponse;
import learning.example.supabase.Service.ServiceImpl.TodoServiceImpl;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/todos")
public class TodoController {

    private final TodoServiceImpl service;

    public TodoController(TodoServiceImpl service) {
        this.service = service;
    }

    @PostMapping
    public TodoResponse create(@RequestBody TodoRequest request) {
        return service.createTodo(request);
    }

    @GetMapping()
    public List<TodoResponse> getAll() {
        return service.getAllTodos();
    }

    @PatchMapping("/{id}")
    public TodoResponse update(@PathVariable Long id, @RequestBody TodoRequest request) {
        return service.update(id, request);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        if(id != null) {
            service.delete(id);
        }else{
            System.out.println("Todo not found!");
        }
    }

    @GetMapping("/accounts/{id}")
    public List<TodoResponse> getByAccount(@PathVariable Long id) {
        return service.getTodoById(id);
    }
}

