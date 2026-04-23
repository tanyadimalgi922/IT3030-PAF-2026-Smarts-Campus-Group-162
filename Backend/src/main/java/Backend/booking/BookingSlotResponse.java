package Backend.booking;

public record BookingSlotResponse(
        String date,
        String startTime,
        String endTime,
        String state,
        int leftCount,
        int pendingCount,
        int bookedCount,
        boolean availableForRequest
) {
}
