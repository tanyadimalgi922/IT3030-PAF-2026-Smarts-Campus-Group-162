package Backend.booking;

import jakarta.validation.constraints.NotBlank;

public record BookingReviewRequest(@NotBlank String reason) {
}
