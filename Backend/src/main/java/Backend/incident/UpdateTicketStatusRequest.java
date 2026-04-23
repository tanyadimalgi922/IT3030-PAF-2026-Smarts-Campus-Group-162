package Backend.incident;

import Backend.user.UserRole;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record UpdateTicketStatusRequest(
        @NotNull TicketStatus status,
        String resolutionNotes,
        String rejectionReason,
        @NotBlank String actorId,
        @NotBlank String actorName,
        @NotNull UserRole actorRole
) {
}
