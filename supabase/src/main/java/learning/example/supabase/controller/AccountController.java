package learning.example.supabase.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import learning.example.supabase.DTOs.*;
import learning.example.supabase.service.serviceImpl.AccountServiceImpl;
import learning.example.supabase.utils.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/accounts")
public class AccountController {
    private final AccountServiceImpl accountService;
    private final JwtUtil jwtUtil;
    @Autowired
    public AccountController(AccountServiceImpl accountService, JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
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
    public ResponseEntity<AccountResponse> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication != null && authentication.isAuthenticated()) {
            String username = authentication.getName();
            Long userId = (Long) authentication.getDetails();

            // Get account from service
            AccountResponse account = accountService.getAccountById(userId);
            return ResponseEntity.ok(account);
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        System.out.println("=== Login Attempt ===");
        AccountResponse account = accountService.login(request);

        if (account != null) {
            // Generate JWT token
            String token = jwtUtil.generateToken(account.getUsername(), account.getId());

            System.out.println("Login successful for: " + account.getUsername());
            System.out.println("Generated token: " + token.substring(0, 20) + "...");

            LoginResponse response = new LoginResponse(account, token);
            return ResponseEntity.ok(response);
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
