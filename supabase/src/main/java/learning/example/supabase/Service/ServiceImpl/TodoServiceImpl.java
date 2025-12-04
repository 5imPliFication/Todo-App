package learning.example.supabase.Service.ServiceImpl;

import learning.example.supabase.DTOs.AccountResponse;
import learning.example.supabase.DTOs.TodoRequest;
import learning.example.supabase.DTOs.TodoResponse;
import learning.example.supabase.Entity.Account;
import learning.example.supabase.Entity.Todo;
import learning.example.supabase.Repository.AccountRepository;
import learning.example.supabase.Repository.TodoRepository;
import learning.example.supabase.Service.TodoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;

@Service
public class TodoServiceImpl implements TodoService {
    private final TodoRepository repo;
    private final AccountRepository accountRepo;
    @Autowired
    public TodoServiceImpl(TodoRepository repo,  AccountRepository accountRepo) {
        this.repo = repo;
        this.accountRepo = accountRepo;
    }

    public TodoResponse update(Long id, TodoRequest newData) {
        Todo todo = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Todo not found"));

        todo.setTitle(newData.getTitle());
        todo.setNote(newData.getNote());
        todo.setCompleted(newData.getCompleted());
        Todo saved = repo.save(todo);

        return new TodoResponse(saved.getId(), saved.getTitle(), saved.getNote(), saved.getCompleted());
    }

    public void delete(Long id) {
        repo.deleteById(id);
    }

    @Override
    public TodoResponse createTodo(TodoRequest request) {
        Account acc = accountRepo.findById(request.getAccountId())
                .orElseThrow(() -> new RuntimeException("Account not found"));
        Todo todo = new Todo();
        todo.setTitle(request.getTitle());
        todo.setNote(request.getNote());
        todo.setCompleted(request.getCompleted() != null ? request.getCompleted() : false);
        todo.setAccount(acc);
        Todo saved = repo.save(todo);
        return new TodoResponse(saved.getId(), saved.getTitle(), saved.getNote(), saved.getCompleted());
    }

    @Override
    public List<TodoResponse> getAllTodos() {
        List<Todo> todos = repo.findAll();
        return todos.stream()
                .map(todo -> new TodoResponse(
                        todo.getId(),
                        todo.getTitle(),
                        todo.getNote(),
                        todo.getCompleted()
                )).toList();
    }

    @Override
    public List<TodoResponse> getTodoById(Long id) {
        Account account = accountRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Account not found"));

        List<Todo> todos = repo.findByAccount(account);

        return todos.stream()
                .map(todo -> new TodoResponse(
                        todo.getId(),
                        todo.getTitle(),
                        todo.getNote(),
                        todo.getCompleted()
                )).toList();
    }

    @Override
    public TodoResponse getTodoByTitle(String title) {
        Todo found = repo.findByTitle(title)
                .orElseThrow(() -> new RuntimeException("Todo not found"));

        return new TodoResponse(
                found.getId(),
                found.getTitle(),
                found.getNote(),
                found.getCompleted()
        );
    }


}
