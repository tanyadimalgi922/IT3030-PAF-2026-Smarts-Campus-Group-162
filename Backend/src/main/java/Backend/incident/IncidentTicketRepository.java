package Backend.incident;

import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface IncidentTicketRepository extends MongoRepository<IncidentTicket, String> {
    List<IncidentTicket> findAllByOrderByCreatedAtDesc();
    List<IncidentTicket> findByCreatedByUserIdOrderByCreatedAtDesc(String createdByUserId);
    List<IncidentTicket> findByAssignedTechnicianIdOrderByCreatedAtDesc(String assignedTechnicianId);
    List<IncidentTicket> findByStatusOrderByCreatedAtDesc(TicketStatus status);
}
