package Backend.incident;

import Backend.user.UserRole;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/incidents")
public class IncidentTicketController {

    private final IncidentTicketService incidentTicketService;

    public IncidentTicketController(IncidentTicketService incidentTicketService) {
        this.incidentTicketService = incidentTicketService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public IncidentTicket create(@Valid @RequestBody CreateIncidentTicketRequest request) {
        return incidentTicketService.create(request);
    }

    @GetMapping
    public List<IncidentTicket> getTickets(
            @RequestParam(required = false) String createdByUserId,
            @RequestParam(required = false) String assignedTechnicianId,
            @RequestParam(required = false) TicketStatus status
    ) {
        return incidentTicketService.findTickets(createdByUserId, assignedTechnicianId, status);
    }

    @GetMapping("/technicians")
    public List<TechnicianOption> getTechnicians() {
        return incidentTicketService.getTechnicians();
    }

    @PatchMapping("/{id}/assign")
    public IncidentTicket assign(@PathVariable String id, @Valid @RequestBody AssignTicketRequest request) {
        return incidentTicketService.assign(id, request);
    }

    @PatchMapping("/{id}/status")
    public IncidentTicket updateStatus(@PathVariable String id, @Valid @RequestBody UpdateTicketStatusRequest request) {
        return incidentTicketService.updateStatus(id, request);
    }

    @PostMapping("/{id}/comments")
    public IncidentTicket addComment(@PathVariable String id, @Valid @RequestBody TicketCommentRequest request) {
        return incidentTicketService.addComment(id, request);
    }

    @PutMapping("/{ticketId}/comments/{commentId}")
    public IncidentTicket updateComment(
            @PathVariable String ticketId,
            @PathVariable String commentId,
            @Valid @RequestBody TicketCommentRequest request
    ) {
        return incidentTicketService.updateComment(ticketId, commentId, request);
    }

    @DeleteMapping("/{ticketId}/comments/{commentId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteComment(
            @PathVariable String ticketId,
            @PathVariable String commentId,
            @RequestParam String actorId,
            @RequestParam UserRole actorRole
    ) {
        incidentTicketService.deleteComment(ticketId, commentId, actorId, actorRole);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleBadRequest(IllegalArgumentException exception) {
        return ResponseEntity.badRequest().body(Map.of("message", exception.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidation(MethodArgumentNotValidException exception) {
        String message = exception.getBindingResult().getFieldErrors().stream()
                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                .collect(Collectors.joining(", "));

        return ResponseEntity.badRequest().body(Map.of("message", message));
    }
}
