package learning.example.supabase.Service;

import jakarta.validation.Valid;
import learning.example.supabase.DTOs.AccountRequest;
import learning.example.supabase.DTOs.AccountResponse;
import learning.example.supabase.DTOs.LoginRequest;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;

public interface AccountService {
    AccountResponse createAccount(AccountRequest request);
    List<AccountResponse> getAllAccounts();
    AccountResponse update(Long id, AccountRequest request);
    void delete(Long id);
    AccountResponse getAccountById(Long id);
    AccountResponse getAccountByEmail(String email);
    AccountResponse getAccountByUserName(String userName);

    AccountResponse login(LoginRequest request);
}
