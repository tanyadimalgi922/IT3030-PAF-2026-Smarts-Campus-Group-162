package Backend.booking;

import org.springframework.data.mongodb.repository.MongoRepository;

public interface ResourceBookingRepository extends MongoRepository<ResourceBooking, String> {
}
