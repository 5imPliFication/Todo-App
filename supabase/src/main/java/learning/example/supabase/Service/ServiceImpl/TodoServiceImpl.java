package learning.example.supabase.Service.ServiceImpl;

import jakarta.persistence.EntityNotFoundException;
import learning.example.supabase.DTOs.AccountRequest;
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
    private TodoResponse mapToResponse(Todo todo) {
        TodoResponse response = new TodoResponse();
        response.setId(todo.getId());
        response.setTitle(todo.getTitle());
        response.setNote(todo.getNote());
        response.setCompleted(todo.getCompleted());
        return response;
    }

    public TodoResponse update(Long id, TodoRequest newData) {
        Todo todo = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Todo not found"));

        todo.setTitle(newData.getTitle());
        todo.setNote(newData.getNote());
        todo.setCompleted(newData.getCompleted());
        Todo saved = repo.save(todo);

        return mapToResponse(saved);
    }

    @Override
    public void delete(Long id) {
        if (!repo.existsById(id)) {
            throw new EntityNotFoundException("Todo not found with id: " + id);
        }
        repo.deleteById(id);
    }

    @Override
    public TodoResponse createTodo(TodoRequest request, Long accountId) {
        Account account = accountRepo.findById(accountId)
                .orElseThrow(() -> new RuntimeException("Account not found"));

        Todo todo = new Todo();
        todo.setTitle(request.getTitle());
        todo.setNote(request.getNote());
        todo.setCompleted(false);
        todo.setAccount(account);

        repo.save(todo);

        return mapToResponse(todo);
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
    public List<TodoResponse> getTodoByAccountId(Long id) {
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

    @Override
    public TodoResponse getById(Long id) {
        Todo found = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Todo not found"));

        return new TodoResponse(
                found.getId(),
                found.getTitle(),
                found.getNote(),
                found.getCompleted()
        );
    }


}
