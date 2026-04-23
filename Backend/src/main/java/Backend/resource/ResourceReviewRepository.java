package Backend.resource;

import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ResourceReviewRepository extends MongoRepository<ResourceReview, String> {
    boolean existsByBookingId(String bookingId);
    List<ResourceReview> findByUserId(String userId);
    List<ResourceReview> findByResourceId(String resourceId);
}
