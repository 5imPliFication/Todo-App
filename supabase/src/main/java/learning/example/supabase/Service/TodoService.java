package learning.example.supabase.Service;

import learning.example.supabase.Entity.Todo;
import learning.example.supabase.Repository.TodoRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TodoService {

    private final TodoRepository repo;

    public TodoService(TodoRepository repo) {
        this.repo = repo;
    }

    public Todo create(Todo todo) {
        return repo.save(todo);
    }

    public List<Todo> getAll() {
        return repo.findAll();
    }

    public Todo update(Long id, Todo newData) {
        Todo todo = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Todo not found"));

        todo.setTitle(newData.getTitle());
        todo.setCompleted(newData.getCompleted());

        return repo.save(todo);
    }

    public void delete(Long id) {
        repo.deleteById(id);
    }
}
