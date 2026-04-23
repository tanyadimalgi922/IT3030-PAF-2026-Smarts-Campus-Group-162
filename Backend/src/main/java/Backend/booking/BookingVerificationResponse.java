package Backend.booking;

public record BookingVerificationResponse(
        String bookingId,
        String resourceName,
        String studentName,
        String studentEmail,
        String date,
        String startTime,
        String endTime,
        int expectedAttendees,
        String purpose,
        String status,
        String reviewedBy,
        String reviewReason,
        boolean verified
) {
}
