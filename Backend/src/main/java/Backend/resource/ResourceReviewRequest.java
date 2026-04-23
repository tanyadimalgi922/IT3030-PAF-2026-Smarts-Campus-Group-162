package Backend.resource;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public record ResourceReviewRequest(
        @NotBlank String bookingId,
        @NotBlank String userId,
        @NotBlank String userName,
        @NotBlank String userEmail,
        @Min(1) @Max(5) int rating,
        @NotBlank String feedback
) {
}
