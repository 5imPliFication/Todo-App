package learning.example.supabase.Controller;

import learning.example.supabase.DTOs.AccountRequest;
import learning.example.supabase.DTOs.AccountResponse;
import learning.example.supabase.DTOs.TodoRequest;
import learning.example.supabase.DTOs.TodoResponse;
import learning.example.supabase.Service.ServiceImpl.AccountServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/accounts")
public class AccountController {
    private final AccountServiceImpl accountService;
    @Autowired
    public AccountController(AccountServiceImpl accountService) {
        this.accountService = accountService;
    }

    @PostMapping("/register")
    public AccountResponse create(@RequestBody AccountRequest request) {
        return accountService.createAccount(request);
    }

    @GetMapping
    public List<AccountResponse> getAll() {
        return accountService.getAllAccounts();
    }

    @PatchMapping("/{id}")
    public AccountResponse update(@PathVariable Long id, @RequestBody AccountRequest request) {
        return accountService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        if(id != null) {
            accountService.delete(id);
        }else{
            System.out.println("Todo not found!");
        }
    }

    //RELEASE MEEEEEEEEEEEEEEEEEEEEEEE!!!!!

}
