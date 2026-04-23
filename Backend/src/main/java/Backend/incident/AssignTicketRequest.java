package Backend.incident;

import jakarta.validation.constraints.NotBlank;

public record AssignTicketRequest(
        @NotBlank String technicianId
) {
}
