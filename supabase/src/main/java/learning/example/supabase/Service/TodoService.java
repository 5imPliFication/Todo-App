package learning.example.supabase.Service;

import learning.example.supabase.DTOs.TodoRequest;
import learning.example.supabase.DTOs.TodoResponse;

import java.util.List;

public interface TodoService {
    TodoResponse createTodo(TodoRequest request);
    List<TodoResponse> getAllTodos();
    List<TodoResponse> getTodoById(Long id);
    TodoResponse getTodoByTitle(String title);

}
