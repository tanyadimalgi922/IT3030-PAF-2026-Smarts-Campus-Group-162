const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8081/api";

async function request(endpoint, options) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
  const data = await readJson(response);

  if (!response.ok) {
    throw new Error(data.message || "Incident request failed.");
  }

  return data;
}

export function createIncident(payload) {
  return request("/incidents", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export function getIncidentTickets(filters = {}) {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, value);
    }
  });

  const query = params.toString();
  return request(`/incidents${query ? `?${query}` : ""}`);
}

export function getTechnicians() {
  return request("/incidents/technicians");
}

export function assignIncident(ticketId, technicianId) {
  return request(`/incidents/${ticketId}/assign`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ technicianId }),
  });
}

export function updateIncidentStatus(ticketId, payload) {
  return request(`/incidents/${ticketId}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export function addIncidentComment(ticketId, payload) {
  return request(`/incidents/${ticketId}/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export function updateIncidentComment(ticketId, commentId, payload) {
  return request(`/incidents/${ticketId}/comments/${commentId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export function deleteIncidentComment(ticketId, commentId, actorId, actorRole) {
  const params = new URLSearchParams({ actorId, actorRole });
  return request(`/incidents/${ticketId}/comments/${commentId}?${params.toString()}`, {
    method: "DELETE",
  });
}

async function readJson(response) {
  try {
    return await response.json();
  } catch {
    return {};
  }
}
