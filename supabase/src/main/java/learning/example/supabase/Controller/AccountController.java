package learning.example.supabase.Controller;

import jakarta.servlet.http.HttpServletRequest;
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
    public ResponseEntity<AccountResponse> getCurrentUser(HttpServletRequest request) {
        System.out.println("=== Checking current user session ===");
        HttpSession session = request.getSession(false); //don't create if doesn't exist
        if (session == null) {
            System.out.println("No session exists");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        System.out.println("Session ID: " + session.getId());
        AccountResponse account = (AccountResponse) session.getAttribute("account");

        if (account == null) {
            System.out.println("Session exists but no account stored");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        System.out.println("Account found: " + account.getUsername());
        return ResponseEntity.ok(account);
    }

    @PostMapping("/login")
    public ResponseEntity<AccountResponse> login(
            @RequestBody LoginRequest request,
            HttpServletRequest httpRequest
    ) {
        AccountResponse account = accountService.login(request);

        if (account != null) {
            // manually create session
            HttpSession session = httpRequest.getSession(false);
            if(session != null) {
                session.invalidate(); //invalidate, remove any previously created session
            }
            else {
                HttpSession newSession = httpRequest.getSession(true); // create if didnt exist
                assert newSession != null;
                newSession.setAttribute("account", account);  // store user for later use
            }
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
