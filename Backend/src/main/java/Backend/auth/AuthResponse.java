package Backend.auth;

import Backend.user.UserRole;

public record AuthResponse(
        String id,
        String fullName,
        String email,
        UserRole role,
        String registrationNumber,
        String faculty,
        String specialization,
        String message
) {
}
