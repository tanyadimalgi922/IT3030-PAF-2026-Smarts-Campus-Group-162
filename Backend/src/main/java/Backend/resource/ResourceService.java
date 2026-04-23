package Backend.resource;

import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.Comparator;
import java.util.List;

@Service
public class ResourceService {

    private final CampusResourceRepository campusResourceRepository;

    public ResourceService(CampusResourceRepository campusResourceRepository) {
        this.campusResourceRepository = campusResourceRepository;
    }

    public CampusResource create(CampusResource resource) {
        return campusResourceRepository.save(resource);
    }

    public List<CampusResource> findResources(String search, ResourceType type, String location, Integer minCapacity) {
        return campusResourceRepository.findAll().stream()
                .filter(resource -> matchesSearch(resource, search))
                .filter(resource -> type == null || resource.getType() == type)
                .filter(resource -> matchesLocation(resource, location))
                .filter(resource -> minCapacity == null || resource.getCapacity() >= minCapacity)
                .sorted(Comparator.comparing(CampusResource::getCreatedAt).reversed())
                .toList();
    }

    private boolean matchesSearch(CampusResource resource, String search) {
        if (!StringUtils.hasText(search)) {
            return true;
        }

        String normalized = search.toLowerCase();
        return resource.getName().toLowerCase().contains(normalized)
                || resource.getLocation().toLowerCase().contains(normalized)
                || resource.getType().name().toLowerCase().contains(normalized);
    }

    private boolean matchesLocation(CampusResource resource, String location) {
        if (!StringUtils.hasText(location)) {
            return true;
        }

        return resource.getLocation().toLowerCase().contains(location.toLowerCase());
    }
}
