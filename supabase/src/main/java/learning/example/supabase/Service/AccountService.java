package learning.example.supabase.Service;

import learning.example.supabase.DTOs.AccountResponse;

public interface AccountService {
    AccountResponse getAccountById(Long id);
    AccountResponse getAccountByEmail(String email);
    AccountResponse getAccountByUserName(String userName);
}
