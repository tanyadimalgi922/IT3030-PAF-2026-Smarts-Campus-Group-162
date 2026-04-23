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
  const [selectedTicketId, setSelectedTicketId] = useState("");
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

  useEffect(() => {
    if (!tickets.length) {
      setSelectedTicketId("");
      return;
    }

    const hasSelectedTicket = tickets.some((ticket) => ticket.id === selectedTicketId);
    if (!hasSelectedTicket) {
      setSelectedTicketId(tickets[0].id);
    }
  }, [selectedTicketId, tickets]);

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
  const selectedTicket = (mode === "technician" || mode === "admin")
    ? tickets.find((ticket) => ticket.id === selectedTicketId) || null
    : null;
  const selectedTicketLocked = isLockedTicket(selectedTicket);
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
  const studentTicketStats = mode === "student" ? getStudentTicketStats(tickets) : null;

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
        {mode === "technician" || mode === "admin" ? (
          <div className="flex flex-wrap gap-2">
            {[
              { value: "", label: "All" },
              { value: "OPEN", label: "Open" },
              { value: "IN_PROGRESS", label: "In Progress" },
              { value: "RESOLVED", label: "Resolved" },
              { value: "CLOSED", label: "Closed" },
              ...(mode === "admin" ? [{ value: "REJECTED", label: "Rejected" }] : []),
            ].map((tab) => (
              <button
                key={tab.value || "all"}
                className={`min-h-11 rounded-full px-4 text-sm font-black transition ${
                  statusFilter === tab.value
                    ? "bg-campus-navy text-white shadow-sm"
                    : "border border-blue-100 bg-white text-campus-navy hover:border-campus-blue"
                }`}
                onClick={() => setStatusFilter(tab.value)}
                type="button"
              >
                {tab.label}
              </button>
            ))}
          </div>
        ) : (
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
        )}
      </div>

      {mode === "student" && tickets.length > 0 && (
        <div className="mt-5 grid gap-4 md:grid-cols-4">
          <StudentStatCard label="Total Tickets" tone="navy" value={studentTicketStats.total} />
          <StudentStatCard label="Open" tone="amber" value={studentTicketStats.open} />
          <StudentStatCard label="In Progress" tone="sky" value={studentTicketStats.inProgress} />
          <StudentStatCard label="Resolved / Closed" tone="emerald" value={studentTicketStats.finished} />
        </div>
      )}

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

      {mode === "technician" || mode === "admin" ? (
        <div className="mt-5">
          {loading ? (
            <div className="rounded-[2rem] border border-blue-100 bg-white p-6 text-sm font-bold text-campus-blue shadow-sm">
              Loading incident tickets...
            </div>
          ) : tickets.length > 0 ? (
            <div className="grid gap-4 xl:grid-cols-[0.85fr_1.15fr]">
              <section className="rounded-[2rem] border border-blue-100 bg-white p-4 shadow-sm sm:p-5">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-campus-blue">Basic Details</p>
                <div className="mt-4 grid gap-3">
                  {tickets.map((ticket) => (
                    <button
                      key={ticket.id}
                      className={`rounded-2xl border p-4 text-left transition ${
                        selectedTicketId === ticket.id
                          ? "border-campus-blue bg-[#f8fbff] shadow-sm"
                          : "border-slate-200 bg-white hover:border-campus-blue hover:bg-[#fbfdff]"
                      }`}
                      onClick={() => setSelectedTicketId(ticket.id)}
                      type="button"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] ${statusTone(ticket.status)}`}>
                          {formatLabel(ticket.status)}
                        </span>
                        <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] ${priorityTone(ticket.priority)}`}>
                          {formatLabel(ticket.priority)}
                        </span>
                      </div>
                      <h3 className="mt-3 text-lg font-black text-campus-navy">{ticket.resourceName}</h3>
                      <p className="mt-1 text-sm font-semibold text-slate-600">{ticket.category}</p>
                      <div className="mt-3 grid gap-1 text-xs font-semibold text-slate-600">
                        <p>Reported by: {ticket.createdByUserName}</p>
                        <p>Location: {ticket.resourceLocation}</p>
                        {mode === "admin" && (
                          <p>Assigned: {ticket.assignedTechnicianName || "Not assigned"}</p>
                        )}
                        <p>Created: {formatDateTime(ticket.createdAt)}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </section>

              <section className="rounded-[2rem] border border-blue-100 bg-white p-5 shadow-sm sm:p-6">
                {selectedTicket ? (
                  <>
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] ${statusTone(selectedTicket.status)}`}>
                            {formatLabel(selectedTicket.status)}
                          </span>
                          <span className={`rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] ${priorityTone(selectedTicket.priority)}`}>
                            {formatLabel(selectedTicket.priority)}
                          </span>
                        </div>
                        <h3 className="mt-4 text-3xl font-black text-campus-navy">{selectedTicket.resourceName}</h3>
                        <p className="mt-2 text-sm font-semibold text-slate-600">
                          {selectedTicket.resourceLocation}
                          {selectedTicket.resourceBuilding ? ` • ${selectedTicket.resourceBuilding}` : ""}
                          {selectedTicket.resourceFloor ? ` • ${selectedTicket.resourceFloor}` : ""}
                          {selectedTicket.resourceRoomNumber ? ` • ${selectedTicket.resourceRoomNumber}` : ""}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-slate-100 bg-[#f8fbff] p-4 text-sm text-slate-700 lg:min-w-72">
                        <InfoRow label="Category" value={selectedTicket.category} />
                        <InfoRow label="Reported by" value={selectedTicket.createdByUserName} />
                        <InfoRow label="Contact" value={selectedTicket.preferredContactDetails} />
                        <InfoRow label="Assigned" value={selectedTicket.assignedTechnicianName || "Not assigned"} />
                        <InfoRow label="Created" value={formatDateTime(selectedTicket.createdAt)} />
                      </div>
                    </div>

                    <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                      <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">Issue Description</p>
                      <p className="mt-3 text-sm leading-7 text-slate-700">{selectedTicket.description}</p>
                    </div>

                    {selectedTicket.imageAttachments?.length > 0 && (
                      <div className="mt-5 grid gap-3 sm:grid-cols-3">
                        {selectedTicket.imageAttachments.map((image, index) => (
                          <img
                            alt={`Ticket attachment ${index + 1}`}
                            className="h-36 w-full rounded-2xl object-cover"
                            key={`${selectedTicket.id}-img-${index}`}
                            src={image}
                          />
                        ))}
                      </div>
                    )}

                    {(selectedTicket.rejectionReason || selectedTicket.resolutionNotes) && (
                      <div className="mt-5 grid gap-3 md:grid-cols-2">
                        {selectedTicket.rejectionReason && (
                          <div className="rounded-2xl border border-red-100 bg-red-50 p-4">
                            <p className="text-xs font-black uppercase tracking-[0.16em] text-red-700">Rejection reason</p>
                            <p className="mt-2 text-sm leading-6 text-red-900">{selectedTicket.rejectionReason}</p>
                          </div>
                        )}
                        {selectedTicket.resolutionNotes && (
                          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                            <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">Resolution notes</p>
                            <p className="mt-2 text-sm leading-6 text-emerald-900">{selectedTicket.resolutionNotes}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {mode === "admin" ? (
                      <div className="mt-5 grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
                        <section className="rounded-2xl border border-blue-100 bg-[#f8fbff] p-4">
                          <p className="text-xs font-black uppercase tracking-[0.16em] text-campus-blue">Assign technician</p>
                          <div className="mt-3 flex flex-col gap-3">
                            <select
                              className="field-input"
                              onChange={(event) => setAssignments((current) => ({ ...current, [selectedTicket.id]: event.target.value }))}
                              value={assignments[selectedTicket.id] || ""}
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
                              disabled={selectedTicketLocked || !assignments[selectedTicket.id] || ticketActionId === selectedTicket.id}
                              onClick={() => handleAssign(selectedTicket.id)}
                              type="button"
                            >
                              Assign Technician
                            </button>
                          </div>
                        </section>

                        <StatusEditor
                          disabled={selectedTicketLocked || ticketActionId === selectedTicket.id}
                          form={statusForms[selectedTicket.id] || { status: "", resolutionNotes: "", rejectionReason: "" }}
                          onChange={(field, value) =>
                            setStatusForms((current) => ({
                              ...current,
                              [selectedTicket.id]: { ...current[selectedTicket.id], [field]: value },
                            }))
                          }
                          onSubmit={() => handleStatusUpdate(selectedTicket.id)}
                          ticket={selectedTicket}
                        />
                      </div>
                    ) : (
                      <div className="mt-5">
                        <StatusEditor
                          disabled={selectedTicketLocked || ticketActionId === selectedTicket.id}
                          form={statusForms[selectedTicket.id] || { status: "", resolutionNotes: "", rejectionReason: "" }}
                          mode="technician"
                          onChange={(field, value) =>
                            setStatusForms((current) => ({
                              ...current,
                              [selectedTicket.id]: { ...current[selectedTicket.id], [field]: value },
                            }))
                          }
                          onSubmit={() => handleStatusUpdate(selectedTicket.id)}
                          ticket={selectedTicket}
                        />
                      </div>
                    )}

                    <TicketCommentsSection
                      commentEditMap={commentEditMap}
                      commentInputMap={commentInputMap}
                      editingCommentId={editingCommentId}
                      handleCommentDelete={handleCommentDelete}
                      handleCommentSave={handleCommentSave}
                      handleCommentSubmit={handleCommentSubmit}
                      setCommentEditMap={setCommentEditMap}
                      setCommentInputMap={setCommentInputMap}
                      setDraftComment={setDraftComment}
                      setEditingCommentId={setEditingCommentId}
                      ticketLocked={selectedTicketLocked}
                      ticket={selectedTicket}
                      ticketActionId={ticketActionId}
                      user={user}
                    />
                  </>
                ) : null}
              </section>
            </div>
          ) : (
            <div className="rounded-[2rem] border border-blue-100 bg-white p-6 text-sm font-bold text-slate-600 shadow-sm">
              {mode === "admin" ? "No incident tickets found." : "No tickets are currently assigned to you."}
            </div>
          )}
        </div>
      ) : (
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
                  <InfoRow label="Ticket ID" value={ticket.id} />
                </div>
              </div>

              {mode === "student" && (
                <div className="mt-5 rounded-[1.75rem] border border-blue-100 bg-[#f8fbff] p-4 sm:p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.16em] text-campus-blue">Progress</p>
                      <p className="mt-2 text-sm font-semibold text-slate-600">{getStudentProgressMessage(ticket)}</p>
                    </div>
                    <button
                      className="min-h-11 rounded-2xl border border-campus-blue bg-white px-4 text-sm font-black text-campus-blue transition hover:bg-campus-blue hover:text-white"
                      onClick={() => printTicket(ticket)}
                      type="button"
                    >
                      Print Ticket
                    </button>
                  </div>

                  <div className="mt-4">
                    <TicketProgressTracker ticket={ticket} />
                  </div>
                </div>
              )}

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

              <TicketCommentsSection
                commentEditMap={commentEditMap}
                commentInputMap={commentInputMap}
                editingCommentId={editingCommentId}
                handleCommentDelete={handleCommentDelete}
                handleCommentSave={handleCommentSave}
                handleCommentSubmit={handleCommentSubmit}
                setCommentEditMap={setCommentEditMap}
                setCommentInputMap={setCommentInputMap}
                setDraftComment={setDraftComment}
                setEditingCommentId={setEditingCommentId}
                ticket={ticket}
                ticketActionId={ticketActionId}
                user={user}
              />
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
      )}
    </section>
  );
}

function TicketCommentsSection({
  commentEditMap,
  commentInputMap,
  editingCommentId,
  handleCommentDelete,
  handleCommentSave,
  handleCommentSubmit,
  setCommentEditMap,
  setCommentInputMap,
  setDraftComment,
  setEditingCommentId,
  ticketLocked = false,
  ticket,
  ticketActionId,
  user,
}) {
  return (
    <section className="mt-5 rounded-2xl border border-slate-100 bg-slate-50 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">Comments</p>
        <span className="text-xs font-bold text-slate-500">
          {ticketLocked ? "Closed tickets are locked." : "Owners can edit or delete their own comments"}
        </span>
      </div>

      <div className="mt-3 grid gap-3">
        {ticket.comments?.length > 0 ? (
          ticket.comments.map((comment) => {
            const canManage = !ticketLocked && (comment.authorId === user.id || user.role === "ADMIN");
            const isEditing = editingCommentId === comment.id;

            return (
              <div className={`rounded-2xl border p-4 shadow-sm ${commentRoleCardTone(comment.authorRole)}`} key={comment.id}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-black text-campus-navy">
                      {comment.authorName}
                      <span className={`ml-2 rounded-full px-2 py-1 text-[10px] uppercase tracking-[0.14em] ${commentRoleBadgeTone(comment.authorRole)}`}>
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
                      disabled={ticketLocked}
                      onChange={(event) => {
                        setDraftComment(event.target.value);
                        setCommentEditMap((current) => ({ ...current, [comment.id]: event.target.value }));
                      }}
                      value={commentEditMap[comment.id] ?? comment.message}
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
          disabled={ticketLocked}
          onChange={(event) => setCommentInputMap((current) => ({ ...current, [ticket.id]: event.target.value }))}
          placeholder={ticketLocked ? "Closed tickets cannot be changed" : "Add a comment to this ticket"}
          value={commentInputMap[ticket.id] || ""}
        />
        <button
          className="primary-action mt-3 min-h-10 rounded-2xl px-4 text-xs font-black text-white disabled:opacity-60"
          disabled={ticketLocked || ticketActionId === ticket.id || !(commentInputMap[ticket.id] || "").trim()}
          onClick={() => handleCommentSubmit(ticket.id)}
          type="button"
        >
          Add Comment
        </button>
      </div>
    </section>
  );
}

function StatusEditor({ disabled, form, mode = "admin", onChange, onSubmit, ticket }) {
  const options = mode === "technician"
    ? getTechnicianStatusOptions(ticket.status)
    : getAdminStatusOptions(ticket.status);
  const locked = isLockedTicket(ticket);

  return (
    <section className="rounded-2xl border border-blue-100 bg-[#f8fbff] p-4">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-campus-blue">Status management</p>
      <div className="mt-3 grid gap-3">
        <select
          className="field-input"
          disabled={locked}
          onChange={(event) => onChange("status", event.target.value)}
          value={form.status || ""}
        >
          <option value="">{locked ? "Closed ticket" : "Select next status"}</option>
          {options.map((status) => (
            <option key={status} value={status}>
              {formatLabel(status)}
            </option>
          ))}
        </select>

        <textarea
          className="field-input min-h-24"
          disabled={locked}
          onChange={(event) => onChange("resolutionNotes", event.target.value)}
          placeholder={locked ? "Closed tickets are locked" : "Resolution notes"}
          value={form.resolutionNotes || ""}
        />

        {mode !== "technician" && (
          <textarea
            className="field-input min-h-20"
            disabled={locked}
            onChange={(event) => onChange("rejectionReason", event.target.value)}
            placeholder={locked ? "Closed tickets are locked" : "Rejection reason"}
            value={form.rejectionReason || ""}
          />
        )}

        {locked && (
          <p className="text-xs font-bold text-slate-500">
            Closed tickets cannot be updated. Only admins can move a resolved ticket to closed.
          </p>
        )}

        <button
          className="primary-action min-h-12 rounded-2xl px-5 text-sm font-black text-white disabled:opacity-60"
          disabled={locked || disabled || !form.status}
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

function StudentStatCard({ label, tone, value }) {
  return (
    <div className={`rounded-[1.5rem] border p-4 shadow-sm ${studentStatTone(tone)}`}>
      <p className="text-xs font-black uppercase tracking-[0.16em]">{label}</p>
      <p className="mt-3 text-3xl font-black">{value}</p>
    </div>
  );
}

function TicketProgressTracker({ ticket }) {
  const steps = getTicketProgressSteps(ticket);

  return (
    <div className={`grid gap-3 ${steps.length === 4 ? "md:grid-cols-4" : "md:grid-cols-3"}`}>
      {steps.map((step) => (
        <div
          className={`rounded-2xl border px-4 py-4 transition ${
            step.completed ? "border-campus-blue bg-white shadow-sm" : "border-slate-200 bg-slate-50"
          } ${step.rejected ? "border-red-200 bg-red-50" : ""}`}
          key={step.key}
        >
          <div className="flex items-center justify-between gap-3">
            <span className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-black ${
              step.completed
                ? "bg-campus-blue text-white"
                : step.rejected
                  ? "bg-red-600 text-white"
                  : "border border-slate-200 bg-white text-slate-500"
            }`}
            >
              {step.rejected ? "!" : step.order}
            </span>
            <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] ${
              step.completed
                ? "bg-emerald-50 text-emerald-700"
                : step.rejected
                  ? "bg-red-100 text-red-700"
                  : "bg-slate-200 text-slate-600"
            }`}
            >
              {step.completed ? "Done" : step.rejected ? "Stopped" : "Waiting"}
            </span>
          </div>
          <p className="mt-4 text-sm font-black text-campus-navy">{step.label}</p>
          <p className="mt-2 text-xs leading-6 text-slate-600">{step.description}</p>
        </div>
      ))}
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

function commentRoleBadgeTone(role) {
  if (role === "ADMIN") return "bg-violet-100 text-violet-700";
  if (role === "TECHNICIAN") return "bg-sky-100 text-sky-700";
  if (role === "STUDENT") return "bg-emerald-100 text-emerald-700";
  return "bg-slate-100 text-slate-600";
}

function commentRoleCardTone(role) {
  if (role === "ADMIN") return "border-violet-100 bg-violet-50/60";
  if (role === "TECHNICIAN") return "border-sky-100 bg-sky-50/60";
  if (role === "STUDENT") return "border-emerald-100 bg-emerald-50/60";
  return "border-slate-100 bg-white";
}

function isLockedTicket(ticket) {
  return ticket?.status === "CLOSED";
}

function getStudentTicketStats(tickets) {
  return tickets.reduce((summary, ticket) => {
    summary.total += 1;

    if (ticket.status === "OPEN") summary.open += 1;
    if (ticket.status === "IN_PROGRESS") summary.inProgress += 1;
    if (ticket.status === "RESOLVED" || ticket.status === "CLOSED") summary.finished += 1;

    return summary;
  }, {
    total: 0,
    open: 0,
    inProgress: 0,
    finished: 0,
  });
}

function getTicketProgressSteps(ticket) {
  if (ticket.status === "REJECTED") {
    return [
      {
        key: "reported",
        label: "Reported",
        description: "Your incident was submitted successfully.",
        completed: true,
        order: 1,
      },
      {
        key: "reviewed",
        label: "Reviewed",
        description: "The maintenance team checked the request details.",
        completed: true,
        order: 2,
      },
      {
        key: "rejected",
        label: "Rejected",
        description: ticket.rejectionReason || "This ticket could not continue.",
        completed: false,
        rejected: true,
        order: 3,
      },
    ];
  }

  const progressIndex = {
    OPEN: 0,
    IN_PROGRESS: 1,
    RESOLVED: 2,
    CLOSED: 3,
  }[ticket.status] ?? 0;

  return [
    {
      key: "reported",
      label: "Reported",
      description: "Your issue has been logged in the system.",
      completed: progressIndex >= 0,
      order: 1,
    },
    {
      key: "in-progress",
      label: "In Progress",
      description: ticket.assignedTechnicianName
        ? `${ticket.assignedTechnicianName} is handling this issue.`
        : "Waiting for technician assignment and work to begin.",
      completed: progressIndex >= 1,
      order: 2,
    },
    {
      key: "resolved",
      label: "Resolved",
      description: ticket.resolutionNotes || "Work is completed and waiting for final closure.",
      completed: progressIndex >= 2,
      order: 3,
    },
    {
      key: "closed",
      label: "Closed",
      description: "The incident workflow is fully finished.",
      completed: progressIndex >= 3,
      order: 4,
    },
  ];
}

function getStudentProgressMessage(ticket) {
  if (ticket.status === "OPEN") {
    return "Your ticket has been received and is waiting for action.";
  }

  if (ticket.status === "IN_PROGRESS") {
    return ticket.assignedTechnicianName
      ? `Work is in progress with ${ticket.assignedTechnicianName}.`
      : "Work is now in progress.";
  }

  if (ticket.status === "RESOLVED") {
    return "The issue has been resolved and is awaiting final closure.";
  }

  if (ticket.status === "CLOSED") {
    return "This incident has been fully completed.";
  }

  return ticket.rejectionReason || "This incident was rejected.";
}

function studentStatTone(tone) {
  if (tone === "amber") return "border-amber-100 bg-amber-50 text-amber-800";
  if (tone === "sky") return "border-sky-100 bg-sky-50 text-sky-800";
  if (tone === "emerald") return "border-emerald-100 bg-emerald-50 text-emerald-800";
  return "border-blue-100 bg-white text-campus-navy";
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

function printTicket(ticket) {
  if (typeof window === "undefined") return;

  const printWindow = window.open("", "_blank", "width=900,height=700");
  if (!printWindow) return;

  const attachments = (ticket.imageAttachments || [])
    .map((image, index) => `
      <div style="margin-top:16px;">
        <p style="margin:0 0 8px;font-size:12px;font-weight:700;color:#475569;">Attachment ${index + 1}</p>
        <img src="${image}" alt="Ticket attachment ${index + 1}" style="width:100%;max-height:280px;object-fit:cover;border:1px solid #dbeafe;border-radius:12px;" />
      </div>
    `)
    .join("");

  const notes = [
    ticket.resolutionNotes
      ? `<div style="margin-top:16px;padding:16px;border-radius:14px;background:#ecfdf5;border:1px solid #a7f3d0;"><p style="margin:0;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:0.12em;color:#047857;">Resolution Notes</p><p style="margin:8px 0 0;color:#065f46;line-height:1.7;">${escapeHtml(ticket.resolutionNotes)}</p></div>`
      : "",
    ticket.rejectionReason
      ? `<div style="margin-top:16px;padding:16px;border-radius:14px;background:#fef2f2;border:1px solid #fecaca;"><p style="margin:0;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:0.12em;color:#b91c1c;">Rejection Reason</p><p style="margin:8px 0 0;color:#7f1d1d;line-height:1.7;">${escapeHtml(ticket.rejectionReason)}</p></div>`
      : "",
  ].join("");

  const location = [
    ticket.resourceLocation,
    ticket.resourceBuilding,
    ticket.resourceFloor,
    ticket.resourceRoomNumber,
  ].filter(Boolean).join(" | ");

  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>Incident Ticket ${escapeHtml(ticket.id)}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 32px; color: #0f172a; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; gap: 24px; margin-bottom: 24px; }
          .badge { display: inline-block; margin-right: 8px; padding: 6px 10px; border-radius: 999px; background: #eff6ff; color: #1d4ed8; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; }
          .panel { border: 1px solid #e2e8f0; border-radius: 18px; padding: 18px; margin-top: 18px; }
          .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px 24px; }
          .label { font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.12em; color: #64748b; }
          .value { margin-top: 4px; font-size: 14px; font-weight: 600; color: #0f172a; }
          .description { white-space: pre-wrap; line-height: 1.7; color: #334155; }
          @media print { body { margin: 18px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <p style="margin:0;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:0.16em;color:#2563eb;">Smart Campus Incident Ticket</p>
            <h1 style="margin:12px 0 0;font-size:30px;">${escapeHtml(ticket.resourceName || "Campus Resource")}</h1>
            <p style="margin:10px 0 0;font-size:14px;color:#475569;">Printed on ${escapeHtml(formatDateTime(new Date().toISOString()))}</p>
          </div>
          <div>
            <span class="badge">${escapeHtml(formatLabel(ticket.status))}</span>
            <span class="badge">${escapeHtml(formatLabel(ticket.priority))}</span>
          </div>
        </div>
        <div class="panel">
          <div class="grid">
            <div><div class="label">Ticket ID</div><div class="value">${escapeHtml(ticket.id)}</div></div>
            <div><div class="label">Category</div><div class="value">${escapeHtml(ticket.category)}</div></div>
            <div><div class="label">Reported By</div><div class="value">${escapeHtml(ticket.createdByUserName)}</div></div>
            <div><div class="label">Contact</div><div class="value">${escapeHtml(ticket.preferredContactDetails)}</div></div>
            <div><div class="label">Assigned Technician</div><div class="value">${escapeHtml(ticket.assignedTechnicianName || "Not assigned")}</div></div>
            <div><div class="label">Created</div><div class="value">${escapeHtml(formatDateTime(ticket.createdAt))}</div></div>
            <div><div class="label">Location</div><div class="value">${escapeHtml(location)}</div></div>
            <div><div class="label">Progress</div><div class="value">${escapeHtml(getStudentProgressMessage(ticket))}</div></div>
          </div>
        </div>
        <div class="panel">
          <div class="label">Issue Description</div>
          <p class="description">${escapeHtml(ticket.description)}</p>
        </div>
        ${notes}
        ${attachments ? `<div class="panel"><div class="label">Attachments</div>${attachments}</div>` : ""}
      </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&#39;");
}

export default IncidentTicketsPage;
