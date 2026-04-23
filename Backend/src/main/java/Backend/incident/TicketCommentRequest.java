package Backend.incident;

import Backend.user.UserRole;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record TicketCommentRequest(
        @NotBlank String authorId,
        @NotBlank String authorName,
        @NotNull UserRole authorRole,
        @NotBlank String message
) {
}
