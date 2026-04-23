package Backend.resource;

import java.time.Instant;

public record ResourceReviewView(
        String id,
        String resourceId,
        String resourceName,
        String bookingId,
        String userId,
        String userName,
        String userEmail,
        int rating,
        String feedback,
        Instant createdAt
) {
}
