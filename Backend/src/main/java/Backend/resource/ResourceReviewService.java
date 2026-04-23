package Backend.resource;

import Backend.booking.BookingStatus;
import Backend.booking.ResourceBooking;
import Backend.booking.ResourceBookingRepository;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;

@Service
public class ResourceReviewService {

    private final ResourceReviewRepository reviewRepository;
    private final CampusResourceRepository resourceRepository;
    private final ResourceBookingRepository bookingRepository;

    public ResourceReviewService(
            ResourceReviewRepository reviewRepository,
            CampusResourceRepository resourceRepository,
            ResourceBookingRepository bookingRepository
    ) {
        this.reviewRepository = reviewRepository;
        this.resourceRepository = resourceRepository;
        this.bookingRepository = bookingRepository;
    }

    public ResourceReviewView createReview(String resourceId, ResourceReviewRequest request) {
        CampusResource resource = resourceRepository.findById(resourceId)
                .orElseThrow(() -> new IllegalArgumentException("Resource not found."));

        ResourceBooking booking = bookingRepository.findById(request.bookingId())
                .orElseThrow(() -> new IllegalArgumentException("Approved booking not found."));

        if (reviewRepository.existsByBookingId(request.bookingId())) {
            throw new IllegalArgumentException("This approved booking has already been reviewed.");
        }

        if (booking.getStatus() != BookingStatus.APPROVED) {
            throw new IllegalArgumentException("Only approved bookings can be reviewed.");
        }

        if (!resourceId.equals(booking.getResourceId()) || !request.userId().equals(booking.getUserId())) {
            throw new IllegalArgumentException("This booking is not valid for the selected review.");
        }

        if (!StringUtils.hasText(request.feedback())) {
            throw new IllegalArgumentException("Feedback is required.");
        }

        ResourceReview review = new ResourceReview();
        review.setResourceId(resourceId);
        review.setResourceName(resource.getName());
        review.setBookingId(booking.getId());
        review.setUserId(request.userId());
        review.setUserName(request.userName());
        review.setUserEmail(request.userEmail());
        review.setRating(request.rating());
        review.setFeedback(request.feedback().trim());
        review.setCreatedAt(Instant.now());
        return toView(reviewRepository.save(review));
    }

    public List<ResourceReviewView> findReviews(String resourceId, String userId) {
        return reviewRepository.findAll().stream()
                .filter(review -> !StringUtils.hasText(resourceId) || resourceId.equals(review.getResourceId()))
                .filter(review -> !StringUtils.hasText(userId) || userId.equals(review.getUserId()))
                .sorted(Comparator.comparing(
                        ResourceReview::getCreatedAt,
                        Comparator.nullsLast(Comparator.naturalOrder())
                ).reversed())
                .map(this::toView)
                .toList();
    }

    public List<ResourceReviewView> findReviewsForResource(String resourceId, int limit) {
        return reviewRepository.findByResourceId(resourceId).stream()
                .sorted(Comparator.comparing(
                        ResourceReview::getCreatedAt,
                        Comparator.nullsLast(Comparator.naturalOrder())
                ).reversed())
                .limit(limit)
                .map(this::toView)
                .toList();
    }

    public double getAverageRating(String resourceId) {
        List<ResourceReview> reviews = reviewRepository.findByResourceId(resourceId);
        if (reviews.isEmpty()) {
            return 0;
        }

        double average = reviews.stream()
                .mapToInt(ResourceReview::getRating)
                .average()
                .orElse(0);

        return Math.round(average * 10.0) / 10.0;
    }

    public int getReviewCount(String resourceId) {
        return reviewRepository.findByResourceId(resourceId).size();
    }

    private ResourceReviewView toView(ResourceReview review) {
        return new ResourceReviewView(
                review.getId(),
                review.getResourceId(),
                review.getResourceName(),
                review.getBookingId(),
                review.getUserId(),
                review.getUserName(),
                review.getUserEmail(),
                review.getRating(),
                review.getFeedback(),
                review.getCreatedAt()
        );
    }
}
