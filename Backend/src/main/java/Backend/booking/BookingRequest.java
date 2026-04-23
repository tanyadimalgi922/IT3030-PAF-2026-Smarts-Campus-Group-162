package Backend.booking;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public record BookingRequest(
        @NotBlank String resourceId,
        @NotBlank String userId,
        @NotBlank String userName,
        @Email String userEmail,
        @NotBlank String date,
        @NotBlank String startTime,
        @NotBlank String endTime,
        @NotBlank String purpose,
        @Min(1) int expectedAttendees
) {
}
