package Backend.resource;

import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeParseException;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;

@Service
public class ResourceService {

    private final CampusResourceRepository campusResourceRepository;
    private final ResourceReviewService resourceReviewService;

    public ResourceService(CampusResourceRepository campusResourceRepository, ResourceReviewService resourceReviewService) {
        this.campusResourceRepository = campusResourceRepository;
        this.resourceReviewService = resourceReviewService;
    }

    public CampusResource create(CampusResource resource) {
        validateResource(resource, null);
        if (resource.getCreatedAt() == null) {
            resource.setCreatedAt(Instant.now());
        }
        return campusResourceRepository.save(resource);
    }

    public CampusResource getById(String id) {
        return enrich(campusResourceRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Resource not found.")));
    }

    public CampusResource update(String id, CampusResource resource) {
        CampusResource existing = getById(id);
        validateResource(resource, id);
        resource.setId(existing.getId());
        resource.setCreatedAt(existing.getCreatedAt() == null ? Instant.now() : existing.getCreatedAt());
        return campusResourceRepository.save(resource);
    }

    public void delete(String id) {
        if (!campusResourceRepository.existsById(id)) {
            throw new IllegalArgumentException("Resource not found.");
        }
        campusResourceRepository.deleteById(id);
    }

    public List<CampusResource> findResources(
            String search,
            ResourceType type,
            String location,
            String building,
            String floor,
            Integer minCapacity
    ) {
        return campusResourceRepository.findAll().stream()
                .filter(resource -> matchesSearch(resource, search))
                .filter(resource -> type == null || resource.getType() == type)
                .filter(resource -> matchesLocation(resource, location))
                .filter(resource -> matchesBuilding(resource, building))
                .filter(resource -> matchesFloor(resource, floor))
                .filter(resource -> minCapacity == null || resource.getCapacity() >= minCapacity)
                .sorted(Comparator.comparing(
                        CampusResource::getCreatedAt,
                        Comparator.nullsLast(Comparator.naturalOrder())
                ).reversed())
                .map(this::enrich)
                .toList();
    }

    private CampusResource enrich(CampusResource resource) {
        resource.setAverageRating(resourceReviewService.getAverageRating(resource.getId()));
        resource.setReviewCount(resourceReviewService.getReviewCount(resource.getId()));
        resource.setRecentReviews(resourceReviewService.findReviewsForResource(resource.getId(), 3));
        return resource;
    }

    private boolean matchesSearch(CampusResource resource, String search) {
        if (!StringUtils.hasText(search)) {
            return true;
        }

        String normalized = search.toLowerCase();
        return contains(resource.getName(), normalized)
                || contains(resource.getLocation(), normalized)
                || contains(resource.getType() == null ? null : resource.getType().name(), normalized);
    }

    private boolean matchesLocation(CampusResource resource, String location) {
        if (!StringUtils.hasText(location)) {
            return true;
        }

        return contains(resource.getLocation(), location.toLowerCase());
    }

    private boolean matchesBuilding(CampusResource resource, String building) {
        if (!StringUtils.hasText(building)) {
            return true;
        }

        return contains(resource.getBuilding(), building.toLowerCase());
    }

    private boolean matchesFloor(CampusResource resource, String floor) {
        if (!StringUtils.hasText(floor)) {
            return true;
        }

        return contains(resource.getFloor(), floor.toLowerCase());
    }

    private boolean contains(String value, String search) {
        return value != null && value.toLowerCase().contains(search);
    }

    private void validateResource(CampusResource resource, String currentResourceId) {
        if (resource.getType() == ResourceType.EQUIPMENT) {
            resource.setCapacity(1);
        }

        if (isDuplicateName(resource.getName(), currentResourceId)) {
            throw new IllegalArgumentException("Resource name must be unique.");
        }

        if (StringUtils.hasText(resource.getRoomNumber()) && isDuplicateRoomNumber(resource.getRoomNumber(), currentResourceId)) {
            throw new IllegalArgumentException("Room number must be unique.");
        }

        validateAvailabilityWindows(resource.getAvailabilityWindows());
    }

    private boolean isDuplicateName(String name, String currentResourceId) {
        if (!StringUtils.hasText(name)) {
            return false;
        }

        String normalizedName = name.trim().toLowerCase();
        return campusResourceRepository.findAll().stream()
                .filter(resource -> !Objects.equals(resource.getId(), currentResourceId))
                .anyMatch(resource -> StringUtils.hasText(resource.getName())
                        && resource.getName().trim().toLowerCase().equals(normalizedName));
    }

    private boolean isDuplicateRoomNumber(String roomNumber, String currentResourceId) {
        String normalizedRoom = roomNumber.trim().toLowerCase();
        return campusResourceRepository.findAll().stream()
                .filter(resource -> !Objects.equals(resource.getId(), currentResourceId))
                .anyMatch(resource -> StringUtils.hasText(resource.getRoomNumber())
                        && resource.getRoomNumber().trim().toLowerCase().equals(normalizedRoom));
    }

    private void validateAvailabilityWindows(List<AvailabilityWindow> windows) {
        if (windows == null || windows.isEmpty()) {
            throw new IllegalArgumentException("At least one availability window is required.");
        }

        LocalDate today = LocalDate.now();

        for (AvailabilityWindow window : windows) {
            LocalDate startDate = parseDate(window.getStartDate(), "Start date is invalid.");
            LocalDate endDate = parseDate(window.getEndDate(), "End date is invalid.");
            LocalTime startTime = parseTime(window.getStartTime(), "Start time is invalid.");
            LocalTime endTime = parseTime(window.getEndTime(), "End time is invalid.");

            if (startDate.isBefore(today)) {
                throw new IllegalArgumentException("Start date must be today or a future date.");
            }

            if (endDate.isBefore(startDate)) {
                throw new IllegalArgumentException("End date must be on or after the start date.");
            }

            if (!isHalfHourTime(startTime) || !isHalfHourTime(endTime)) {
                throw new IllegalArgumentException("Time must be on the hour or half hour, such as 08:00 or 08:30.");
            }

            if (startDate.equals(endDate) && !endTime.isAfter(startTime)) {
                throw new IllegalArgumentException("End time must be after start time for the same date.");
            }
        }
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
}
