package learning.example.supabase.Controller;

import learning.example.supabase.Entity.Todo;
import learning.example.supabase.Service.TodoService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/todos")
public class TodoController {

    private final TodoService service;

    public TodoController(TodoService service) {
        this.service = service;
    }

    @PostMapping
    public Todo create(@RequestBody Todo todo) {
        return service.create(todo);
    }

    @GetMapping
    public List<Todo> getAll() {
        return service.getAll();
    }

    @PatchMapping("/{id}")
    public Todo update(@PathVariable Long id, @RequestBody Todo todo) {
        return service.update(id, todo);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        if(id != null) {
            service.delete(id);
        }else{
            System.out.println("Todo not found!");
        }

    }
}

