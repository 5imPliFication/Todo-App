package learning.example.supabase.Service;

import learning.example.supabase.DTOs.TodoRequest;
import learning.example.supabase.DTOs.TodoResponse;

import java.util.List;

public interface TodoService {
    void delete(Long id);

    TodoResponse createTodo(TodoRequest request, Long accountId);
    List<TodoResponse> getAllTodos();
    List<TodoResponse> getTodoByAccountId(Long id);
    TodoResponse getTodoByTitle(String title);

    TodoResponse getById(Long id);
}
