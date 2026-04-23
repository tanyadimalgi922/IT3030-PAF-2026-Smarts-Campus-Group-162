package Backend.incident;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public record CreateIncidentTicketRequest(
        @NotBlank String resourceId,
        @NotBlank String createdByUserId,
        @NotBlank String createdByUserName,
        @Email @NotBlank String createdByUserEmail,
        @NotBlank String category,
        @NotBlank String description,
        @NotNull TicketPriority priority,
        @NotBlank String preferredContactDetails,
        @Size(max = 3) List<@NotBlank String> imageAttachments
) {
}
