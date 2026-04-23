import { useEffect, useState } from "react";
import { getResources } from "../../api/resourceApi";
import {
  addIncidentComment,
  assignIncident,
  createIncident,
  deleteIncidentComment,
  getIncidentTickets,
  getTechnicians,
  updateIncidentComment,
  updateIncidentStatus,
} from "../../api/incidentApi";

const categories = [
  "Electrical Issue",
  "Projector / Display",
  "Network / Wi-Fi",
  "Air Conditioning",
  "Furniture Damage",
  "Cleanliness / Safety",
  "Access Control",
  "Other",
];

const priorities = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

function IncidentTicketsPage({ mode, onBack, preselectedResourceId = "", user }) {
  const [resources, setResources] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMeta, setLoadingMeta] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [ticketActionId, setTicketActionId] = useState("");
  const [editingCommentId, setEditingCommentId] = useState("");
  const [draftComment, setDraftComment] = useState("");
  const [commentInputMap, setCommentInputMap] = useState({});
  const [commentEditMap, setCommentEditMap] = useState({});
  const [assignments, setAssignments] = useState({});
  const [statusForms, setStatusForms] = useState({});
  const [form, setForm] = useState({
    resourceId: preselectedResourceId,
    category: categories[0],
    description: "",
    priority: "MEDIUM",
    preferredContactDetails: user.email,
    imageAttachments: [],
  });

  useEffect(() => {
    setForm((current) => ({
      ...current,
      resourceId: preselectedResourceId || current.resourceId,
    }));
  }, [preselectedResourceId]);

  useEffect(() => {
    let active = true;

    async function loadMeta() {
      if (mode === "technician") {
        return;
      }

      setLoadingMeta(true);

      try {
        const requests = [mode === "student" ? getResources() : Promise.resolve([])];
        if (mode === "admin") {
          requests.push(getTechnicians());
        }

        const [resourceData, technicianData = []] = await Promise.all(requests);

        if (active) {
          setResources(resourceData || []);
          setTechnicians(technicianData || []);
        }
      } catch (requestError) {
        if (active) {
          setError(requestError.message);
        }
      } finally {
        if (active) {
          setLoadingMeta(false);
        }
      }
    }

    loadMeta();
    return () => {
      active = false;
    };
  }, [mode]);

  useEffect(() => {
    let active = true;

    async function loadTickets() {
      setLoading(true);
      setError("");

      try {
        const filters = {};

        if (mode === "student") {
          filters.createdByUserId = user.id;
        }

        if (mode === "technician") {
          filters.assignedTechnicianId = user.id;
        }

        if (statusFilter) {
          filters.status = statusFilter;
        }

        const data = await getIncidentTickets(filters);
        if (active) {
          setTickets(data);
          setAssignments(
            Object.fromEntries(data.map((ticket) => [ticket.id, ticket.assignedTechnicianId || ""]))
          );
          setStatusForms(
            Object.fromEntries(
              data.map((ticket) => [
                ticket.id,
                {
                  status: getDefaultNextStatus(ticket.status, mode),
                  resolutionNotes: ticket.resolutionNotes || "",
                  rejectionReason: ticket.rejectionReason || "",
                },
              ])
            )
          );
        }
      } catch (requestError) {
        if (active) {
          setError(requestError.message);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadTickets();
    return () => {
      active = false;
    };
  }, [mode, statusFilter, user.id]);

  const refreshTickets = async () => {
    setLoading(true);

    try {
      const filters = {};
      if (mode === "student") filters.createdByUserId = user.id;
      if (mode === "technician") filters.assignedTechnicianId = user.id;
      if (statusFilter) filters.status = statusFilter;
      const data = await getIncidentTickets(filters);
      setTickets(data);
      setAssignments(Object.fromEntries(data.map((ticket) => [ticket.id, ticket.assignedTechnicianId || ""])));
      setStatusForms(
        Object.fromEntries(
          data.map((ticket) => [
            ticket.id,
            {
              status: getDefaultNextStatus(ticket.status, mode),
              resolutionNotes: ticket.resolutionNotes || "",
              rejectionReason: ticket.rejectionReason || "",
            },
          ])
        )
      );
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (event) => {
    const files = Array.from(event.target.files || []).slice(0, 3);

    try {
      const imageAttachments = await Promise.all(files.map(toDataUrl));
      setForm((current) => ({ ...current, imageAttachments }));
    } catch {
      setError("One or more selected files could not be read.");
    }
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setMessage("");

    try {
      await createIncident({
        ...form,
        createdByUserId: user.id,
        createdByUserName: user.fullName,
        createdByUserEmail: user.email,
      });
      setMessage("Incident ticket created successfully.");
      setForm({
        resourceId: preselectedResourceId || "",
        category: categories[0],
        description: "",
        priority: "MEDIUM",
        preferredContactDetails: user.email,
        imageAttachments: [],
      });
      await refreshTickets();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssign = async (ticketId) => {
    setTicketActionId(ticketId);
    setError("");
    setMessage("");

    try {
      await assignIncident(ticketId, assignments[ticketId]);
      setMessage("Technician assigned successfully.");
      await refreshTickets();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setTicketActionId("");
    }
  };

  const handleStatusUpdate = async (ticketId) => {
    const statusForm = statusForms[ticketId];
    setTicketActionId(ticketId);
    setError("");
    setMessage("");

    try {
      await updateIncidentStatus(ticketId, {
        ...statusForm,
        actorId: user.id,
        actorName: user.fullName,
        actorRole: user.role,
      });
      setMessage("Ticket status updated.");
      await refreshTickets();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setTicketActionId("");
    }
  };

  const handleCommentSubmit = async (ticketId) => {
    const text = (commentInputMap[ticketId] || "").trim();
    if (!text) return;

    setTicketActionId(ticketId);
    setError("");

    try {
      await addIncidentComment(ticketId, {
        authorId: user.id,
        authorName: user.fullName,
        authorRole: user.role,
        message: text,
      });
      setCommentInputMap((current) => ({ ...current, [ticketId]: "" }));
      await refreshTickets();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setTicketActionId("");
    }
  };

  const handleCommentSave = async (ticketId, commentId) => {
    const updatedText = (commentEditMap[commentId] || "").trim();
    if (!updatedText) return;

    setTicketActionId(ticketId);
    setError("");

    try {
      await updateIncidentComment(ticketId, commentId, {
        authorId: user.id,
        authorName: user.fullName,
        authorRole: user.role,
        message: updatedText,
      });
      setEditingCommentId("");
      setDraftComment("");
      await refreshTickets();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setTicketActionId("");
    }
  };

  const handleCommentDelete = async (ticketId, commentId) => {
    setTicketActionId(ticketId);
    setError("");

    try {
      await deleteIncidentComment(ticketId, commentId, user.id, user.role);
      await refreshTickets();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setTicketActionId("");
    }
  };

  const filteredResources = resources.filter((resource) => resource.status === "ACTIVE");
  const pageTitle = mode === "student"
    ? "Report incidents for campus resources."
    : mode === "admin"
      ? "Review tickets and assign technicians."
      : "Track your assigned maintenance tickets.";
  const introText = mode === "student"
    ? "Choose a current resource, describe the issue, and submit evidence images when needed."
    : mode === "admin"
      ? "Monitor ticket flow, assign technicians, reject invalid requests, and close completed work."
      : "Move your assigned work from in progress to resolved and keep clear notes for admin follow-up.";

  return (
    <section className="mt-6">
      <div className="dark-hero rounded-[2rem] p-6 text-white shadow-panel sm:p-9">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.32em] text-sky-200">
              {mode === "student" ? "Incident Tickets" : mode === "admin" ? "Admin Incidents" : "Technician Queue"}
            </p>
            <h1 className="mt-4 text-4xl font-black sm:text-5xl">{pageTitle}</h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-white/80">{introText}</p>
          </div>
          <button
            className="min-h-12 rounded-2xl bg-white px-6 text-sm font-black text-campus-navy"
            onClick={onBack}
            type="button"
          >
            Back to Dashboard
          </button>
        </div>
      </div>

      {mode === "student" && (
        <form className="glass-panel mt-6 rounded-[2rem] p-5 shadow-panel sm:p-8" onSubmit={handleCreate}>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.24em] text-campus-blue">
                Create Ticket
              </p>
              <h2 className="mt-3 text-3xl font-black text-campus-navy">New maintenance incident</h2>
            </div>
            <span className="rounded-full border border-blue-100 bg-white px-4 py-2 text-xs font-black text-campus-navy">
              Up to 3 images
            </span>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <select
              className="field-input"
              onChange={(event) => setForm((current) => ({ ...current, resourceId: event.target.value }))}
              required
              value={form.resourceId}
            >
              <option value="">Select current resource</option>
              {filteredResources.map((resource) => (
                <option key={resource.id} value={resource.id}>
                  {resource.name} - {resource.location}
                </option>
              ))}
            </select>
            <select
              className="field-input"
              onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}
              value={form.category}
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <select
              className="field-input"
              onChange={(event) => setForm((current) => ({ ...current, priority: event.target.value }))}
              value={form.priority}
            >
              {priorities.map((priority) => (
                <option key={priority} value={priority}>
                  {formatLabel(priority)}
                </option>
              ))}
            </select>
            <input
              className="field-input"
              onChange={(event) => setForm((current) => ({ ...current, preferredContactDetails: event.target.value }))}
              placeholder="Preferred contact details"
              required
              value={form.preferredContactDetails}
            />
          </div>

          <textarea
            className="field-input mt-4 min-h-32"
            onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
            placeholder="Describe the incident in detail"
            required
            value={form.description}
          />

          <div className="mt-4 rounded-2xl border border-dashed border-blue-200 bg-[#f8fbff] p-4">
            <label className="text-sm font-black text-campus-navy" htmlFor="incident-images">
              Evidence images
            </label>
            <input
              accept="image/*"
              className="mt-3 block w-full text-sm"
              id="incident-images"
              multiple
              onChange={handleFileChange}
              type="file"
            />
            {form.imageAttachments.length > 0 && (
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {form.imageAttachments.map((image, index) => (
                  <img
                    alt={`Incident evidence ${index + 1}`}
                    className="h-28 w-full rounded-2xl object-cover shadow-sm"
                    key={`${index}-${image.slice(0, 20)}`}
                    src={image}
                  />
                ))}
              </div>
            )}
          </div>

          <button
            className="primary-action mt-5 min-h-12 rounded-2xl px-6 text-sm font-black text-white disabled:opacity-60"
            disabled={submitting || loadingMeta}
            type="submit"
          >
            {submitting ? "Submitting Ticket..." : "Create Incident Ticket"}
          </button>
        </form>
      )}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-campus-blue">
            Ticket Queue
          </p>
          <h2 className="mt-1 text-3xl font-black text-campus-navy">
            {mode === "student" ? "My incidents" : mode === "admin" ? "All incident tickets" : "Assigned incidents"}
          </h2>
        </div>
        <select
          className="field-input sm:max-w-56"
          onChange={(event) => setStatusFilter(event.target.value)}
          value={statusFilter}
        >
          <option value="">All statuses</option>
          {["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED", "REJECTED"].map((status) => (
            <option key={status} value={status}>
              {formatLabel(status)}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
          {error}
        </div>
      )}

      {message && (
        <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
          {message}
        </div>
      )}

      <div className="mt-5 grid gap-4">
        {loading ? (
          <div className="rounded-[2rem] border border-blue-100 bg-white p-6 text-sm font-bold text-campus-blue shadow-sm">
            Loading incident tickets...
          </div>
        ) : tickets.length > 0 ? (
          tickets.map((ticket) => (
            <article className="rounded-[2rem] border border-blue-100 bg-white p-5 shadow-sm sm:p-6" key={ticket.id}>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] ${statusTone(ticket.status)}`}>
                      {formatLabel(ticket.status)}
                    </span>
                    <span className={`rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] ${priorityTone(ticket.priority)}`}>
                      {formatLabel(ticket.priority)}
                    </span>
                  </div>
                  <h3 className="mt-4 text-2xl font-black text-campus-navy">{ticket.resourceName}</h3>
                  <p className="mt-1 text-sm font-semibold text-slate-600">
                    {ticket.resourceLocation}
                    {ticket.resourceBuilding ? ` • ${ticket.resourceBuilding}` : ""}
                    {ticket.resourceFloor ? ` • ${ticket.resourceFloor}` : ""}
                    {ticket.resourceRoomNumber ? ` • ${ticket.resourceRoomNumber}` : ""}
                  </p>
                  <p className="mt-4 text-sm leading-7 text-slate-700">{ticket.description}</p>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-[#f8fbff] p-4 text-sm text-slate-700 lg:min-w-72">
                  <InfoRow label="Category" value={ticket.category} />
                  <InfoRow label="Reported by" value={ticket.createdByUserName} />
                  <InfoRow label="Contact" value={ticket.preferredContactDetails} />
                  <InfoRow label="Assigned" value={ticket.assignedTechnicianName || "Not assigned"} />
                  <InfoRow label="Created" value={formatDateTime(ticket.createdAt)} />
                </div>
              </div>

              {ticket.imageAttachments?.length > 0 && (
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  {ticket.imageAttachments.map((image, index) => (
                    <img
                      alt={`Ticket attachment ${index + 1}`}
                      className="h-36 w-full rounded-2xl object-cover"
                      key={`${ticket.id}-img-${index}`}
                      src={image}
                    />
                  ))}
                </div>
              )}

              {(ticket.rejectionReason || ticket.resolutionNotes) && (
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {ticket.rejectionReason && (
                    <div className="rounded-2xl border border-red-100 bg-red-50 p-4">
                      <p className="text-xs font-black uppercase tracking-[0.16em] text-red-700">Rejection reason</p>
                      <p className="mt-2 text-sm leading-6 text-red-900">{ticket.rejectionReason}</p>
                    </div>
                  )}
                  {ticket.resolutionNotes && (
                    <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                      <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">Resolution notes</p>
                      <p className="mt-2 text-sm leading-6 text-emerald-900">{ticket.resolutionNotes}</p>
                    </div>
                  )}
                </div>
              )}

              {mode === "admin" && (
                <div className="mt-5 grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
                  <section className="rounded-2xl border border-blue-100 bg-[#f8fbff] p-4">
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-campus-blue">Assign technician</p>
                    <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                      <select
                        className="field-input"
                        onChange={(event) => setAssignments((current) => ({ ...current, [ticket.id]: event.target.value }))}
                        value={assignments[ticket.id] || ""}
                      >
                        <option value="">Select technician</option>
                        {technicians.map((technician) => (
                          <option key={technician.id} value={technician.id}>
                            {technician.fullName} - {technician.specialization || "General"}
                          </option>
                        ))}
                      </select>
                      <button
                        className="primary-action min-h-12 rounded-2xl px-5 text-sm font-black text-white disabled:opacity-60"
                        disabled={!assignments[ticket.id] || ticketActionId === ticket.id}
                        onClick={() => handleAssign(ticket.id)}
                        type="button"
                      >
                        Assign
                      </button>
                    </div>
                  </section>

                  <StatusEditor
                    disabled={ticketActionId === ticket.id}
                    form={statusForms[ticket.id] || { status: "", resolutionNotes: "", rejectionReason: "" }}
                    onChange={(field, value) =>
                      setStatusForms((current) => ({
                        ...current,
                        [ticket.id]: { ...current[ticket.id], [field]: value },
                      }))
                    }
                    onSubmit={() => handleStatusUpdate(ticket.id)}
                    ticket={ticket}
                  />
                </div>
              )}

              {mode === "technician" && (
                <div className="mt-5">
                  <StatusEditor
                    disabled={ticketActionId === ticket.id}
                    form={statusForms[ticket.id] || { status: "", resolutionNotes: "", rejectionReason: "" }}
                    mode="technician"
                    onChange={(field, value) =>
                      setStatusForms((current) => ({
                        ...current,
                        [ticket.id]: { ...current[ticket.id], [field]: value },
                      }))
                    }
                    onSubmit={() => handleStatusUpdate(ticket.id)}
                    ticket={ticket}
                  />
                </div>
              )}

              <section className="mt-5 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">Comments</p>
                  <span className="text-xs font-bold text-slate-500">
                    Owners can edit or delete their own comments
                  </span>
                </div>

                <div className="mt-3 grid gap-3">
                  {ticket.comments?.length > 0 ? (
                    ticket.comments.map((comment) => {
                      const canManage = comment.authorId === user.id || user.role === "ADMIN";
                      const isEditing = editingCommentId === comment.id;

                      return (
                        <div className="rounded-2xl bg-white p-4 shadow-sm" key={comment.id}>
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                              <p className="text-sm font-black text-campus-navy">
                                {comment.authorName}
                                <span className="ml-2 rounded-full bg-slate-100 px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-slate-600">
                                  {formatLabel(comment.authorRole)}
                                </span>
                              </p>
                              <p className="mt-1 text-xs font-semibold text-slate-500">
                                {formatDateTime(comment.updatedAt || comment.createdAt)}
                              </p>
                            </div>
                            {canManage && (
                              <div className="flex gap-2">
                                <button
                                  className="rounded-full border border-blue-100 px-3 py-2 text-xs font-black text-campus-blue"
                                  onClick={() => {
                                    setEditingCommentId(comment.id);
                                    setDraftComment(comment.message);
                                    setCommentEditMap((current) => ({ ...current, [comment.id]: comment.message }));
                                  }}
                                  type="button"
                                >
                                  Edit
                                </button>
                                <button
                                  className="rounded-full border border-red-100 px-3 py-2 text-xs font-black text-red-700"
                                  onClick={() => handleCommentDelete(ticket.id, comment.id)}
                                  type="button"
                                >
                                  Delete
                                </button>
                              </div>
                            )}
                          </div>

                          {isEditing ? (
                            <div className="mt-3">
                              <textarea
                                className="field-input min-h-24"
                                onChange={(event) => {
                                  setDraftComment(event.target.value);
                                  setCommentEditMap((current) => ({ ...current, [comment.id]: event.target.value }));
                                }}
                                value={commentEditMap[comment.id] ?? draftComment}
                              />
                              <div className="mt-3 flex gap-2">
                                <button
                                  className="primary-action min-h-10 rounded-2xl px-4 text-xs font-black text-white"
                                  onClick={() => handleCommentSave(ticket.id, comment.id)}
                                  type="button"
                                >
                                  Save
                                </button>
                                <button
                                  className="min-h-10 rounded-2xl border border-slate-200 px-4 text-xs font-black text-slate-600"
                                  onClick={() => {
                                    setEditingCommentId("");
                                    setDraftComment("");
                                  }}
                                  type="button"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <p className="mt-3 text-sm leading-7 text-slate-700">{comment.message}</p>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="rounded-2xl bg-white p-4 text-sm font-semibold text-slate-500 shadow-sm">
                      No comments yet.
                    </div>
                  )}
                </div>

                <div className="mt-4">
                  <textarea
                    className="field-input min-h-24"
                    onChange={(event) => setCommentInputMap((current) => ({ ...current, [ticket.id]: event.target.value }))}
                    placeholder="Add a comment to this ticket"
                    value={commentInputMap[ticket.id] || ""}
                  />
                  <button
                    className="primary-action mt-3 min-h-10 rounded-2xl px-4 text-xs font-black text-white disabled:opacity-60"
                    disabled={ticketActionId === ticket.id || !(commentInputMap[ticket.id] || "").trim()}
                    onClick={() => handleCommentSubmit(ticket.id)}
                    type="button"
                  >
                    Add Comment
                  </button>
                </div>
              </section>
            </article>
          ))
        ) : (
          <div className="rounded-[2rem] border border-blue-100 bg-white p-6 text-sm font-bold text-slate-600 shadow-sm">
            {mode === "student"
              ? "No incident tickets created yet."
              : mode === "admin"
                ? "No incident tickets found."
                : "No tickets are currently assigned to you."}
          </div>
        )}
      </div>
    </section>
  );
}

function StatusEditor({ disabled, form, mode = "admin", onChange, onSubmit, ticket }) {
  const options = mode === "technician"
    ? getTechnicianStatusOptions(ticket.status)
    : getAdminStatusOptions(ticket.status);

  return (
    <section className="rounded-2xl border border-blue-100 bg-[#f8fbff] p-4">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-campus-blue">Status management</p>
      <div className="mt-3 grid gap-3">
        <select
          className="field-input"
          onChange={(event) => onChange("status", event.target.value)}
          value={form.status || ""}
        >
          <option value="">Select next status</option>
          {options.map((status) => (
            <option key={status} value={status}>
              {formatLabel(status)}
            </option>
          ))}
        </select>

        <textarea
          className="field-input min-h-24"
          onChange={(event) => onChange("resolutionNotes", event.target.value)}
          placeholder="Resolution notes"
          value={form.resolutionNotes || ""}
        />

        {mode !== "technician" && (
          <textarea
            className="field-input min-h-20"
            onChange={(event) => onChange("rejectionReason", event.target.value)}
            placeholder="Rejection reason"
            value={form.rejectionReason || ""}
          />
        )}

        <button
          className="primary-action min-h-12 rounded-2xl px-5 text-sm font-black text-white disabled:opacity-60"
          disabled={disabled || !form.status}
          onClick={onSubmit}
          type="button"
        >
          Update Status
        </button>
      </div>
    </section>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 py-2 last:border-b-0 last:pb-0">
      <span className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">{label}</span>
      <span className="text-right text-sm font-semibold text-campus-navy">{value}</span>
    </div>
  );
}

function getDefaultNextStatus(status, mode) {
  if (mode === "technician") {
    return getTechnicianStatusOptions(status)[0] || "";
  }
  return getAdminStatusOptions(status)[0] || "";
}

function getAdminStatusOptions(status) {
  if (status === "OPEN") return ["IN_PROGRESS", "REJECTED"];
  if (status === "IN_PROGRESS") return ["RESOLVED", "REJECTED"];
  if (status === "RESOLVED") return ["CLOSED", "IN_PROGRESS"];
  return [];
}

function getTechnicianStatusOptions(status) {
  if (status === "OPEN") return ["IN_PROGRESS"];
  if (status === "IN_PROGRESS") return ["RESOLVED"];
  if (status === "RESOLVED") return ["IN_PROGRESS"];
  return [];
}

function formatLabel(value) {
  return (value || "")
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function statusTone(status) {
  if (status === "OPEN") return "bg-amber-50 text-amber-700";
  if (status === "IN_PROGRESS") return "bg-sky-50 text-sky-700";
  if (status === "RESOLVED") return "bg-emerald-50 text-emerald-700";
  if (status === "CLOSED") return "bg-slate-100 text-slate-700";
  return "bg-rose-50 text-rose-700";
}

function priorityTone(priority) {
  if (priority === "CRITICAL") return "bg-red-50 text-red-700";
  if (priority === "HIGH") return "bg-orange-50 text-orange-700";
  if (priority === "MEDIUM") return "bg-blue-50 text-blue-700";
  return "bg-emerald-50 text-emerald-700";
}

function formatDateTime(value) {
  if (!value) return "-";

  return new Date(value).toLocaleString("en-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function toDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default IncidentTicketsPage;
