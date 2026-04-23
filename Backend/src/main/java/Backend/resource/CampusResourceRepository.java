package Backend.resource;

import org.springframework.data.mongodb.repository.MongoRepository;

public interface CampusResourceRepository extends MongoRepository<CampusResource, String> {
}
