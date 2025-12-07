package learning.example.supabase.Repository;

import learning.example.supabase.DTOs.TodoResponse;
import learning.example.supabase.Entity.Account;
import learning.example.supabase.Entity.Todo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TodoRepository extends JpaRepository<Todo, Long> {

    Optional<Todo> findByTitle(String title);

    List<Todo> findByAccount(Account account);

    List<Todo> findByAccountId(Long accountId);
}
