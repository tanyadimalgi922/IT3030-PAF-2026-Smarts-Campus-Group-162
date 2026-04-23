package Backend.booking;

public record BookingSlotResponse(
        String startTime,
        String endTime,
        String state,
        String bookingId
) {
}
