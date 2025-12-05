package learning.example.supabase.Service.ServiceImpl;

import learning.example.supabase.DTOs.AccountResponse;
import learning.example.supabase.DTOs.AccountRequest;
import learning.example.supabase.DTOs.LoginRequest;
import learning.example.supabase.DTOs.TodoResponse;
import learning.example.supabase.Entity.Account;
import learning.example.supabase.Entity.Todo;
import learning.example.supabase.Repository.AccountRepository;
import learning.example.supabase.Service.AccountService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class AccountServiceImpl implements AccountService {
    private final AccountRepository repo;
    private final PasswordEncoder passwordEncoder;
    @Autowired
    public AccountServiceImpl(AccountRepository repo, PasswordEncoder passwordEncoder) {
        this.passwordEncoder = passwordEncoder;
        this.repo = repo;
    }

    //func to return response easily
    private AccountResponse convertToResponse(Account account) {
        AccountResponse response = new AccountResponse();
        response.setId(account.getId());
        response.setUsername(account.getUsername());
        response.setEmail(account.getEmail());

        return response;
    }

    //BASIC CRUDs
    @Override
    public AccountResponse createAccount(AccountRequest request) {
        Account account = new Account();
        account.setUsername(request.getUsername());
        account.setPassword(passwordEncoder.encode(request.getPassword()));
        account.setEmail(request.getEmail());
        Account saved = repo.save(account);
        return convertToResponse(saved);
    }
    @Override
    public List<AccountResponse> getAllAccounts() {
        return repo.findAll().stream().
                map(account -> new AccountResponse(account.getId(), account.getUsername()
                        , account.getPassword(), account.getEmail()))
                .toList();
    }
    @Override
    public AccountResponse update(Long id, AccountRequest newData) {
        Account account = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Account not found"));
        account.setUsername(newData.getUsername());
        account.setPassword(passwordEncoder.encode(newData.getPassword()));
        account.setEmail(newData.getEmail());
        Account saved = repo.save(account);

        return convertToResponse(saved);
    }
    @Override
    public void delete(Long id) {
        repo.deleteById(id);
    }

    @Override
    public AccountResponse getAccountById(Long id) {
        Account found = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Account not found"));

        return new AccountResponse(
                found.getId(),
                found.getUsername(),
                found.getPassword(),
                found.getEmail()
        );
    }

    @Override
    public AccountResponse getAccountByEmail(String email) {
        Account found = repo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Account not found"));

        return new AccountResponse(
                found.getId(),
                found.getUsername(),
                found.getPassword(),
                found.getEmail()
        );
    }

    @Override
    public AccountResponse getAccountByUserName(String userName) {
        Account found = repo.findByUsername(userName)
                .orElseThrow(() -> new RuntimeException("Account not found"));

        return new AccountResponse(
                found.getId(),
                found.getUsername(),
                found.getPassword(),
                found.getEmail()
        );
    }

    //Advance functions
    @Override
    public AccountResponse login(LoginRequest request) {
        // Find account by username
        Account account = repo.findByUsername(request.getUsername())
                .orElse(null);
        if (account != null && passwordEncoder.matches(request.getPassword(), account.getPassword())) {
            return convertToResponse(account);
        }
        return null; // Invalid credentials
    }

}
