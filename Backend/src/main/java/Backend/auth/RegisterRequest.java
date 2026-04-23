package Backend.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank String fullName,
        @Email @NotBlank String email,
        @NotBlank @Size(min = 6, message = "Password must contain at least 6 characters") String password,
        String registrationNumber,
        String faculty,
        String employeeId,
        String specialization
) {
}
