package Backend.auth;

import Backend.user.UserAccount;
import Backend.user.UserAccountRepository;
import Backend.user.UserRole;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private static final String ADMIN_ID = "admin";
    private static final String ADMIN_NAME = "System Administrator";
    private static final String ADMIN_EMAIL = "admin@smartcampus.lk";
    private static final String ADMIN_PASSWORD = "Admin@123";

    private final UserAccountRepository userAccountRepository;

    public AuthService(UserAccountRepository userAccountRepository) {
        this.userAccountRepository = userAccountRepository;
    }

    public AuthResponse register(RegisterRequest request, UserRole role) {
        if (userAccountRepository.existsByEmailIgnoreCase(request.email())) {
            throw new IllegalArgumentException("An account already exists for this email.");
        }

        UserAccount user = new UserAccount();
        user.setFullName(request.fullName());
        user.setEmail(request.email().toLowerCase());
        user.setPassword(request.password());
        user.setRole(role);

        if (role == UserRole.STUDENT) {
            user.setRegistrationNumber(request.registrationNumber());
            user.setFaculty(request.faculty());
        }

        if (role == UserRole.TECHNICIAN) {
            user.setEmployeeId(request.employeeId());
            user.setSpecialization(request.specialization());
        }

        UserAccount saved = userAccountRepository.save(user);
        return toResponse(saved, role.name().toLowerCase() + " registration successful.");
    }

    public AuthResponse login(LoginRequest request) {
        if (ADMIN_EMAIL.equalsIgnoreCase(request.email()) && ADMIN_PASSWORD.equals(request.password())) {
            return new AuthResponse(ADMIN_ID, ADMIN_NAME, ADMIN_EMAIL, UserRole.ADMIN, "Admin login successful.");
        }

        UserAccount user = userAccountRepository.findByEmailIgnoreCase(request.email())
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password."));

        if (!user.getPassword().equals(request.password())) {
            throw new IllegalArgumentException("Invalid email or password.");
        }

        return toResponse(user, "Login successful.");
    }

    private AuthResponse toResponse(UserAccount user, String message) {
        return new AuthResponse(user.getId(), user.getFullName(), user.getEmail(), user.getRole(), message);
    }
}
