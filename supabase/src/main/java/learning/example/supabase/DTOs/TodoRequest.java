package learning.example.supabase.DTOs;

import jakarta.annotation.Nullable;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TodoRequest {
    @NotBlank
    private String title;
    @Nullable
    private String note;
    private Boolean completed;
    private Long accountId;
}
