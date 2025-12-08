package learning.example.supabase.DTOs;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TodoResponse {
    private Long id;
    private String title;
    private String note;
    private Boolean completed;
}
