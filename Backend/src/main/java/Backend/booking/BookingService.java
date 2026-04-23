package Backend.booking;

import Backend.resource.AvailabilityWindow;
import Backend.resource.CampusResource;
import Backend.resource.CampusResourceRepository;
import Backend.resource.ResourceStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;

@Service
public class BookingService {

    private static final int SLOT_MINUTES = 120;
    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");

    private final ResourceBookingRepository bookingRepository;
    private final CampusResourceRepository resourceRepository;
    private final BookingNotificationService notificationService;

    public BookingService(
            ResourceBookingRepository bookingRepository,
            CampusResourceRepository resourceRepository,
            BookingNotificationService notificationService
    ) {
        this.bookingRepository = bookingRepository;
        this.resourceRepository = resourceRepository;
        this.notificationService = notificationService;
    }

    public ResourceBooking create(BookingRequest request) {
        CampusResource resource = getResource(request.resourceId());
        LocalDate date = parseDate(request.date(), "Booking date is invalid.");
        LocalTime startTime = parseTime(request.startTime(), "Start time is invalid.");
        LocalTime endTime = parseTime(request.endTime(), "End time is invalid.");

        validateBookableResource(resource);
        validateTimeRange(startTime, endTime);
        validateCapacity(resource, request.expectedAttendees());
        validateInsideAvailability(resource, date, startTime, endTime);
        validateGeneratedSlot(resource, date, startTime, endTime);
        validateSlotAvailability(resource, date, startTime, endTime, request.expectedAttendees(), null);

        ResourceBooking booking = new ResourceBooking();
        booking.setResourceId(resource.getId());
        booking.setResourceName(resource.getName());
        booking.setUserId(request.userId());
        booking.setUserName(request.userName());
        booking.setUserEmail(request.userEmail());
        booking.setDate(date.toString());
        booking.setStartTime(formatTime(startTime));
        booking.setEndTime(formatTime(endTime));
        booking.setPurpose(request.purpose());
        booking.setExpectedAttendees(request.expectedAttendees());
        booking.setStatus(BookingStatus.PENDING);
        booking.setCreatedAt(Instant.now());
        booking.setUpdatedAt(Instant.now());
        return bookingRepository.save(booking);
    }

    public List<ResourceBooking> findBookings(String userId, String resourceId, String date, BookingStatus status) {
        return bookingRepository.findAll().stream()
                .filter(booking -> !StringUtils.hasText(userId) || userId.equals(booking.getUserId()))
                .filter(booking -> !StringUtils.hasText(resourceId) || resourceId.equals(booking.getResourceId()))
                .filter(booking -> !StringUtils.hasText(date) || date.equals(booking.getDate()))
                .filter(booking -> status == null || status == booking.getStatus())
                .sorted(Comparator.comparing(
                        ResourceBooking::getCreatedAt,
                        Comparator.nullsLast(Comparator.naturalOrder())
                ).reversed())
                .toList();
    }

    public List<BookingSlotResponse> getSlots(String resourceId, String dateValue) {
        CampusResource resource = getResource(resourceId);
        LocalDate date = parseDate(dateValue, "Booking date is invalid.");

        return resource.getAvailabilityWindows().stream()
                .filter(window -> windowContainsDate(window, date))
                .flatMap(window -> buildWindowSlots(resource, date, window).stream())
                .sorted(Comparator.comparing(BookingSlotResponse::startTime))
                .toList();
    }

    public ResourceBooking approve(String bookingId, BookingReviewRequest request, String adminName) {
        ResourceBooking booking = getBooking(bookingId);
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new IllegalArgumentException("Only pending bookings can be approved.");
        }

        validateSlotAvailability(
                getResource(booking.getResourceId()),
                parseDate(booking.getDate(), "Booking date is invalid."),
                parseTime(booking.getStartTime(), "Start time is invalid."),
                parseTime(booking.getEndTime(), "End time is invalid."),
                booking.getExpectedAttendees(),
                booking.getId()
        );

        booking.setStatus(BookingStatus.APPROVED);
        booking.setReviewReason(request.reason());
        booking.setReviewedBy(adminName);
        booking.setUpdatedAt(Instant.now());
        ResourceBooking savedBooking = bookingRepository.save(booking);
        notificationService.sendApprovalEmail(savedBooking);
        return savedBooking;
    }

    public ResourceBooking reject(String bookingId, BookingReviewRequest request, String adminName) {
        ResourceBooking booking = getBooking(bookingId);
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new IllegalArgumentException("Only pending bookings can be rejected.");
        }

        booking.setStatus(BookingStatus.REJECTED);
        booking.setReviewReason(request.reason());
        booking.setReviewedBy(adminName);
        booking.setUpdatedAt(Instant.now());
        ResourceBooking savedBooking = bookingRepository.save(booking);
        notificationService.sendRejectionEmail(savedBooking);
        return savedBooking;
    }

    public ResourceBooking cancel(String bookingId, BookingReviewRequest request, String userName) {
        ResourceBooking booking = getBooking(bookingId);
        if (booking.getStatus() != BookingStatus.APPROVED) {
            throw new IllegalArgumentException("Only approved bookings can be cancelled.");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        booking.setReviewReason(request.reason());
        booking.setReviewedBy(userName);
        booking.setUpdatedAt(Instant.now());
        return bookingRepository.save(booking);
    }

    public BookingVerificationResponse getVerification(String bookingId) {
        ResourceBooking booking = getBooking(bookingId);
        return new BookingVerificationResponse(
                booking.getId(),
                booking.getResourceName(),
                booking.getUserName(),
                booking.getUserEmail(),
                booking.getDate(),
                booking.getStartTime(),
                booking.getEndTime(),
                booking.getExpectedAttendees(),
                booking.getPurpose(),
                booking.getStatus().name(),
                booking.getReviewedBy(),
                booking.getReviewReason(),
                booking.getStatus() == BookingStatus.APPROVED
        );
    }

    private ResourceBooking getBooking(String id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found."));
    }

    private CampusResource getResource(String resourceId) {
        return resourceRepository.findById(resourceId)
                .orElseThrow(() -> new IllegalArgumentException("Resource not found."));
    }

    private List<BookingSlotResponse> buildWindowSlots(CampusResource resource, LocalDate date, AvailabilityWindow window) {
        LocalTime start = parseTime(window.getStartTime(), "Availability start time is invalid.");
        LocalTime end = parseTime(window.getEndTime(), "Availability end time is invalid.");
        List<BookingSlotResponse> slots = new ArrayList<>();

        LocalTime cursor = start;
        while (cursor.isBefore(end)) {
            LocalTime slotEnd = cursor.plusMinutes(SLOT_MINUTES);
            if (slotEnd.isAfter(end)) {
                slotEnd = end;
            }

            slots.add(buildSlot(resource, date, cursor, slotEnd));
            cursor = slotEnd;
        }

        return slots;
    }

    private BookingSlotResponse buildSlot(CampusResource resource, LocalDate date, LocalTime start, LocalTime end) {
        List<ResourceBooking> matchingBookings = findMatchingSlotBookings(resource.getId(), date, start, end, null);
        int pendingCount = sumAttendeesByStatus(matchingBookings, BookingStatus.PENDING);
        int bookedCount = sumAttendeesByStatus(matchingBookings, BookingStatus.APPROVED);
        int leftCount = Math.max(resource.getCapacity() - pendingCount - bookedCount, 0);
        boolean timeExpired = isSlotExpiredOrStarted(date, start);
        boolean availableForRequest = leftCount > 0 && !timeExpired;
        String state = availableForRequest ? "AVAILABLE" : "FULL";

        return new BookingSlotResponse(
                date.toString(),
                formatTime(start),
                formatTime(end),
                state,
                leftCount,
                pendingCount,
                bookedCount,
                availableForRequest
        );
    }

    private void validateBookableResource(CampusResource resource) {
        if (resource.getStatus() != ResourceStatus.ACTIVE) {
            throw new IllegalArgumentException("Only active resources can be booked.");
        }
    }

    private void validateCapacity(CampusResource resource, int expectedAttendees) {
        if (expectedAttendees > resource.getCapacity()) {
            throw new IllegalArgumentException("Expected attendees exceed the resource capacity.");
        }
    }

    private void validateTimeRange(LocalTime startTime, LocalTime endTime) {
        if (!isHalfHourTime(startTime) || !isHalfHourTime(endTime)) {
            throw new IllegalArgumentException("Booking times must be on the hour or half hour.");
        }

        if (!endTime.isAfter(startTime)) {
            throw new IllegalArgumentException("End time must be after start time.");
        }
    }

    private void validateInsideAvailability(CampusResource resource, LocalDate date, LocalTime startTime, LocalTime endTime) {
        boolean insideWindow = resource.getAvailabilityWindows().stream()
                .filter(window -> windowContainsDate(window, date))
                .anyMatch(window -> {
                    LocalTime windowStart = parseTime(window.getStartTime(), "Availability start time is invalid.");
                    LocalTime windowEnd = parseTime(window.getEndTime(), "Availability end time is invalid.");
                    return !startTime.isBefore(windowStart) && !endTime.isAfter(windowEnd);
                });

        if (!insideWindow) {
            throw new IllegalArgumentException("Selected time range is outside the resource availability window.");
        }
    }

    private void validateGeneratedSlot(CampusResource resource, LocalDate date, LocalTime startTime, LocalTime endTime) {
        boolean matchesSlot = resource.getAvailabilityWindows().stream()
                .filter(window -> windowContainsDate(window, date))
                .anyMatch(window -> matchesGeneratedWindowSlot(window, startTime, endTime));

        if (!matchesSlot) {
            throw new IllegalArgumentException("Please select one of the generated two-hour slots.");
        }
    }

    private boolean matchesGeneratedWindowSlot(AvailabilityWindow window, LocalTime startTime, LocalTime endTime) {
        LocalTime cursor = parseTime(window.getStartTime(), "Availability start time is invalid.");
        LocalTime windowEnd = parseTime(window.getEndTime(), "Availability end time is invalid.");

        while (cursor.isBefore(windowEnd)) {
            LocalTime slotEnd = cursor.plusMinutes(SLOT_MINUTES);
            if (slotEnd.isAfter(windowEnd)) {
                slotEnd = windowEnd;
            }

            if (cursor.equals(startTime) && slotEnd.equals(endTime)) {
                return true;
            }

            cursor = slotEnd;
        }

        return false;
    }

    private void validateSlotAvailability(
            CampusResource resource,
            LocalDate date,
            LocalTime startTime,
            LocalTime endTime,
            int expectedAttendees,
            String currentBookingId
    ) {
        if (isSlotExpiredOrStarted(date, startTime)) {
            throw new BookingConflictException("Selected slot has already started or expired.");
        }

        List<ResourceBooking> matchingBookings = findMatchingSlotBookings(resource.getId(), date, startTime, endTime, currentBookingId);
        int pendingCount = sumAttendeesByStatus(matchingBookings, BookingStatus.PENDING);
        int bookedCount = sumAttendeesByStatus(matchingBookings, BookingStatus.APPROVED);
        int leftCount = resource.getCapacity() - pendingCount - bookedCount;

        if (expectedAttendees > leftCount) {
            throw new BookingConflictException("Selected slot does not have enough capacity left.");
        }
    }

    private List<ResourceBooking> findMatchingSlotBookings(
            String resourceId,
            LocalDate date,
            LocalTime startTime,
            LocalTime endTime,
            String currentBookingId
    ) {
        return bookingRepository.findAll().stream()
                .filter(booking -> !Objects.equals(booking.getId(), currentBookingId))
                .filter(booking -> resourceId.equals(booking.getResourceId()))
                .filter(booking -> date.toString().equals(booking.getDate()))
                .filter(booking -> booking.getStatus() == BookingStatus.PENDING || booking.getStatus() == BookingStatus.APPROVED)
                .filter(booking -> overlaps(
                        startTime,
                        endTime,
                        parseTime(booking.getStartTime(), "Booking start time is invalid."),
                        parseTime(booking.getEndTime(), "Booking end time is invalid.")
                ))
                .toList();
    }

    private int sumAttendeesByStatus(List<ResourceBooking> bookings, BookingStatus status) {
        return bookings.stream()
                .filter(booking -> booking.getStatus() == status)
                .mapToInt(ResourceBooking::getExpectedAttendees)
                .sum();
    }

    private boolean windowContainsDate(AvailabilityWindow window, LocalDate date) {
        LocalDate startDate = parseDate(window.getStartDate(), "Availability start date is invalid.");
        LocalDate endDate = parseDate(window.getEndDate(), "Availability end date is invalid.");
        return !date.isBefore(startDate) && !date.isAfter(endDate);
    }

    private boolean overlaps(LocalTime start, LocalTime end, LocalTime otherStart, LocalTime otherEnd) {
        return start.isBefore(otherEnd) && end.isAfter(otherStart);
    }

    private boolean isSlotExpiredOrStarted(LocalDate date, LocalTime startTime) {
        LocalDate today = LocalDate.now();
        if (date.isBefore(today)) {
            return true;
        }

        if (date.isAfter(today)) {
            return false;
        }

        return !LocalTime.now().isBefore(startTime);
    }

    private LocalDate parseDate(String value, String message) {
        try {
            return LocalDate.parse(value);
        } catch (DateTimeParseException | NullPointerException exception) {
            throw new IllegalArgumentException(message);
        }
    }

    private LocalTime parseTime(String value, String message) {
        try {
            return LocalTime.parse(value);
        } catch (DateTimeParseException | NullPointerException exception) {
            throw new IllegalArgumentException(message);
        }
    }

    private boolean isHalfHourTime(LocalTime time) {
        return time.getMinute() == 0 || time.getMinute() == 30;
    }

    private String formatTime(LocalTime time) {
        return time.format(TIME_FORMATTER);
    }
}
