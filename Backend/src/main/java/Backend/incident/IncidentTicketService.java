package Backend.incident;

import Backend.resource.CampusResource;
import Backend.resource.CampusResourceRepository;
import Backend.user.UserAccount;
import Backend.user.UserAccountRepository;
import Backend.user.UserRole;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Stream;

@Service
public class IncidentTicketService {

    private final IncidentTicketRepository incidentTicketRepository;
    private final CampusResourceRepository campusResourceRepository;
    private final UserAccountRepository userAccountRepository;

    public IncidentTicketService(
            IncidentTicketRepository incidentTicketRepository,
            CampusResourceRepository campusResourceRepository,
            UserAccountRepository userAccountRepository
    ) {
        this.incidentTicketRepository = incidentTicketRepository;
        this.campusResourceRepository = campusResourceRepository;
        this.userAccountRepository = userAccountRepository;
    }

    public IncidentTicket create(CreateIncidentTicketRequest request) {
        CampusResource resource = campusResourceRepository.findById(request.resourceId())
                .orElseThrow(() -> new IllegalArgumentException("Selected resource does not exist."));

        validateAttachments(request.imageAttachments());

        IncidentTicket ticket = new IncidentTicket();
        ticket.setResourceId(resource.getId());
        ticket.setResourceName(resource.getName());
        ticket.setResourceLocation(resource.getLocation());
        ticket.setResourceBuilding(resource.getBuilding());
        ticket.setResourceFloor(resource.getFloor());
        ticket.setResourceRoomNumber(resource.getRoomNumber());
        ticket.setCategory(request.category().trim());
        ticket.setDescription(request.description().trim());
        ticket.setPriority(request.priority());
        ticket.setPreferredContactDetails(request.preferredContactDetails().trim());
        ticket.setImageAttachments(request.imageAttachments() == null ? new ArrayList<>() : new ArrayList<>(request.imageAttachments()));
        ticket.setCreatedByUserId(request.createdByUserId());
        ticket.setCreatedByUserName(request.createdByUserName().trim());
        ticket.setCreatedByUserEmail(request.createdByUserEmail().trim().toLowerCase());
        ticket.setStatus(TicketStatus.OPEN);
        ticket.setCreatedAt(Instant.now());
        ticket.setUpdatedAt(Instant.now());
        return incidentTicketRepository.save(ticket);
    }

    public List<IncidentTicket> findTickets(String createdByUserId, String assignedTechnicianId, TicketStatus status) {
        Stream<IncidentTicket> ticketStream;

        if (StringUtils.hasText(createdByUserId)) {
            ticketStream = incidentTicketRepository.findByCreatedByUserIdOrderByCreatedAtDesc(createdByUserId).stream();
        } else if (StringUtils.hasText(assignedTechnicianId)) {
            ticketStream = incidentTicketRepository.findByAssignedTechnicianIdOrderByCreatedAtDesc(assignedTechnicianId).stream();
        } else if (status != null) {
            return incidentTicketRepository.findByStatusOrderByCreatedAtDesc(status);
        } else {
            return incidentTicketRepository.findAllByOrderByCreatedAtDesc();
        }

        if (status != null) {
            ticketStream = ticketStream.filter(ticket -> ticket.getStatus() == status);
        }

        return ticketStream.toList();
    }

    public IncidentTicket assign(String id, AssignTicketRequest request) {
        IncidentTicket ticket = getById(id);
        UserAccount technician = userAccountRepository.findById(request.technicianId())
                .filter(user -> user.getRole() == UserRole.TECHNICIAN)
                .orElseThrow(() -> new IllegalArgumentException("Technician account not found."));

        ticket.setAssignedTechnicianId(technician.getId());
        ticket.setAssignedTechnicianName(technician.getFullName());
        ticket.setUpdatedAt(Instant.now());
        addSystemComment(ticket, technician.getId(), technician.getFullName(), technician.getRole(), "Ticket assigned to technician.");
        return incidentTicketRepository.save(ticket);
    }

    public IncidentTicket updateStatus(String id, UpdateTicketStatusRequest request) {
        IncidentTicket ticket = getById(id);

        if (request.actorRole() == UserRole.TECHNICIAN) {
            if (!request.actorId().equals(ticket.getAssignedTechnicianId())) {
                throw new IllegalArgumentException("Only the assigned technician can update this ticket.");
            }
            if (request.status() == TicketStatus.REJECTED || request.status() == TicketStatus.CLOSED) {
                throw new IllegalArgumentException("Technicians cannot set tickets to rejected or closed.");
            }
        }

        if (request.status() == TicketStatus.REJECTED && request.actorRole() != UserRole.ADMIN) {
            throw new IllegalArgumentException("Only admins can reject tickets.");
        }

        if (request.status() == TicketStatus.CLOSED && request.actorRole() == UserRole.STUDENT) {
            throw new IllegalArgumentException("Students cannot close tickets.");
        }

        validateTransition(ticket.getStatus(), request.status());

        if (request.status() == TicketStatus.IN_PROGRESS && !StringUtils.hasText(ticket.getAssignedTechnicianId())) {
            throw new IllegalArgumentException("Assign a technician before moving the ticket to in progress.");
        }

        if (request.status() == TicketStatus.REJECTED && !StringUtils.hasText(request.rejectionReason())) {
            throw new IllegalArgumentException("A rejection reason is required.");
        }

        if ((request.status() == TicketStatus.RESOLVED || request.status() == TicketStatus.CLOSED)
                && !StringUtils.hasText(request.resolutionNotes())) {
            throw new IllegalArgumentException("Resolution notes are required for this status update.");
        }

        ticket.setStatus(request.status());
        ticket.setResolutionNotes(StringUtils.hasText(request.resolutionNotes()) ? request.resolutionNotes().trim() : ticket.getResolutionNotes());
        ticket.setRejectionReason(request.status() == TicketStatus.REJECTED ? request.rejectionReason().trim() : null);
        ticket.setUpdatedAt(Instant.now());

        addSystemComment(
                ticket,
                request.actorId(),
                request.actorName(),
                request.actorRole(),
                "Status updated to " + request.status().name().replace('_', ' ').toLowerCase() + "."
        );

        return incidentTicketRepository.save(ticket);
    }

    public IncidentTicket addComment(String id, TicketCommentRequest request) {
        IncidentTicket ticket = getById(id);

        TicketComment comment = new TicketComment();
        comment.setId(UUID.randomUUID().toString());
        comment.setAuthorId(request.authorId());
        comment.setAuthorName(request.authorName().trim());
        comment.setAuthorRole(request.authorRole());
        comment.setMessage(request.message().trim());
        comment.setCreatedAt(Instant.now());
        comment.setUpdatedAt(Instant.now());

        ticket.getComments().add(comment);
        ticket.setUpdatedAt(Instant.now());
        return incidentTicketRepository.save(ticket);
    }

    public IncidentTicket updateComment(String ticketId, String commentId, TicketCommentRequest request) {
        IncidentTicket ticket = getById(ticketId);
        TicketComment comment = findComment(ticket, commentId);

        if (!canManageComment(comment, request.authorId(), request.authorRole())) {
            throw new IllegalArgumentException("You can only edit your own comments.");
        }

        comment.setMessage(request.message().trim());
        comment.setUpdatedAt(Instant.now());
        ticket.setUpdatedAt(Instant.now());
        return incidentTicketRepository.save(ticket);
    }

    public void deleteComment(String ticketId, String commentId, String actorId, UserRole actorRole) {
        IncidentTicket ticket = getById(ticketId);
        TicketComment comment = findComment(ticket, commentId);

        if (!canManageComment(comment, actorId, actorRole)) {
            throw new IllegalArgumentException("You can only delete your own comments.");
        }

        ticket.getComments().removeIf(existing -> existing.getId().equals(commentId));
        ticket.setUpdatedAt(Instant.now());
        incidentTicketRepository.save(ticket);
    }

    public List<TechnicianOption> getTechnicians() {
        return userAccountRepository.findByRoleOrderByFullNameAsc(UserRole.TECHNICIAN).stream()
                .map(user -> new TechnicianOption(user.getId(), user.getFullName(), user.getEmail(), user.getSpecialization()))
                .toList();
    }

    private IncidentTicket getById(String id) {
        return incidentTicketRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Incident ticket not found."));
    }

    private void validateAttachments(List<String> imageAttachments) {
        if (imageAttachments == null) {
            return;
        }

        if (imageAttachments.size() > 3) {
            throw new IllegalArgumentException("Only up to 3 image attachments are allowed.");
        }

        boolean hasInvalidAttachment = imageAttachments.stream().anyMatch(attachment -> !StringUtils.hasText(attachment));
        if (hasInvalidAttachment) {
            throw new IllegalArgumentException("Image attachments cannot be empty.");
        }
    }

    private void validateTransition(TicketStatus current, TicketStatus next) {
        if (current == next) {
            return;
        }

        boolean allowed = switch (current) {
            case OPEN -> next == TicketStatus.IN_PROGRESS || next == TicketStatus.REJECTED;
            case IN_PROGRESS -> next == TicketStatus.RESOLVED || next == TicketStatus.REJECTED;
            case RESOLVED -> next == TicketStatus.CLOSED || next == TicketStatus.IN_PROGRESS;
            case CLOSED, REJECTED -> false;
        };

        if (!allowed) {
            throw new IllegalArgumentException("Invalid status transition from " + current + " to " + next + ".");
        }
    }

    private TicketComment findComment(IncidentTicket ticket, String commentId) {
        return ticket.getComments().stream()
                .filter(comment -> comment.getId().equals(commentId))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Comment not found."));
    }

    private boolean canManageComment(TicketComment comment, String actorId, UserRole actorRole) {
        return actorRole == UserRole.ADMIN || comment.getAuthorId().equals(actorId);
    }

    private void addSystemComment(
            IncidentTicket ticket,
            String actorId,
            String actorName,
            UserRole actorRole,
            String message
    ) {
        TicketComment comment = new TicketComment();
        comment.setId(UUID.randomUUID().toString());
        comment.setAuthorId(actorId);
        comment.setAuthorName(actorName);
        comment.setAuthorRole(actorRole);
        comment.setMessage(message);
        comment.setCreatedAt(Instant.now());
        comment.setUpdatedAt(Instant.now());
        ticket.getComments().add(comment);
    }
}
