package Backend.resource;

import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;

@Service
public class ResourceService {

    private final CampusResourceRepository campusResourceRepository;

    public ResourceService(CampusResourceRepository campusResourceRepository) {
        this.campusResourceRepository = campusResourceRepository;
    }

    public CampusResource create(CampusResource resource) {
        if (resource.getCreatedAt() == null) {
            resource.setCreatedAt(Instant.now());
        }
        return campusResourceRepository.save(resource);
    }

    public CampusResource getById(String id) {
        return campusResourceRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Resource not found."));
    }

    public CampusResource update(String id, CampusResource resource) {
        CampusResource existing = getById(id);
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
                .toList();
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
}
