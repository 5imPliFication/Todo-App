package learning.example.supabase.Controller;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import learning.example.supabase.DTOs.*;
import learning.example.supabase.Service.ServiceImpl.AccountServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
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
    public AccountResponse create(@Valid @RequestBody AccountRequest request) {
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
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        accountService.delete(id);
        return ResponseEntity.noContent().build();
    }

    //RELEASE MEEEEEEEEEEEEEEEEEEEEEEE!!!!!
    //functions

    @GetMapping("/me")
    public ResponseEntity<AccountResponse> getCurrentUser(HttpSession session) {
        System.out.println("=== Checking current user session ===");
        System.out.println("Session ID: " + (session != null ? session.getId() : "null"));

        if (session != null) {
            AccountResponse account = (AccountResponse) session.getAttribute("account");
            System.out.println("Account in session: " + (account != null ? account.getUsername() : "null"));

            if (account != null) {
                return ResponseEntity.ok(account);
            }
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    @PostMapping("/login")
    public ResponseEntity<AccountResponse> login(
            @RequestBody LoginRequest request,
            HttpServletRequest httpRequest
    ) {
        AccountResponse account = accountService.login(request);

        if (account != null) {
            // manually create session
            HttpSession session = httpRequest.getSession(true);
            session.setAttribute("account", account);  // store user for later use

            return ResponseEntity.ok(account);
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest request) {
        System.out.println("=== Logout Request ===");

        HttpSession session = request.getSession(false);
        if (session != null) {
            System.out.println("Invalidating session: " + session.getId());
            session.invalidate();
        }

        // Clear Spring Security context
        SecurityContextHolder.clearContext();

        System.out.println("Logout successful");
        return ResponseEntity.ok().build();
    }
}
