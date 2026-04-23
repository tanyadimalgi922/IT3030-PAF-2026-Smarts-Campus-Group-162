package Backend.booking;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ResourceBooking createBooking(@Valid @RequestBody BookingRequest request) {
        return bookingService.create(request);
    }

    @GetMapping
    public List<ResourceBooking> getBookings(
            @RequestParam(required = false) String userId,
            @RequestParam(required = false) String resourceId,
            @RequestParam(required = false) String date,
            @RequestParam(required = false) BookingStatus status
    ) {
        return bookingService.findBookings(userId, resourceId, date, status);
    }

    @GetMapping("/slots")
    public List<BookingSlotResponse> getSlots(
            @RequestParam String resourceId,
            @RequestParam String date
    ) {
        return bookingService.getSlots(resourceId, date);
    }

    @GetMapping("/{id}/verification")
    public BookingVerificationResponse getBookingVerification(@PathVariable String id) {
        return bookingService.getVerification(id);
    }

    @PatchMapping("/{id}/approve")
    public ResourceBooking approveBooking(
            @PathVariable String id,
            @RequestParam(defaultValue = "System Administrator") String adminName,
            @Valid @RequestBody BookingReviewRequest request
    ) {
        return bookingService.approve(id, request, adminName);
    }

    @PatchMapping("/{id}/reject")
    public ResourceBooking rejectBooking(
            @PathVariable String id,
            @RequestParam(defaultValue = "System Administrator") String adminName,
            @Valid @RequestBody BookingReviewRequest request
    ) {
        return bookingService.reject(id, request, adminName);
    }

    @PatchMapping("/{id}/cancel")
    public ResourceBooking cancelBooking(
            @PathVariable String id,
            @RequestParam(defaultValue = "Campus user") String userName,
            @Valid @RequestBody BookingReviewRequest request
    ) {
        return bookingService.cancel(id, request, userName);
    }

    @ExceptionHandler(BookingConflictException.class)
    public ResponseEntity<Map<String, String>> handleConflict(BookingConflictException exception) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", exception.getMessage()));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleBadRequest(IllegalArgumentException exception) {
        return ResponseEntity.badRequest().body(Map.of("message", exception.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidation(MethodArgumentNotValidException exception) {
        String message = exception.getBindingResult().getFieldErrors().stream()
                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                .collect(Collectors.joining(", "));

        return ResponseEntity.badRequest().body(Map.of("message", message));
    }
}
