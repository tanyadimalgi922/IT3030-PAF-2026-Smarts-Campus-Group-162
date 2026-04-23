const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8081/api";

async function request(endpoint, options) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
  const data = await readJson(response);

  if (!response.ok) {
    throw new Error(data.message || "Resource request failed.");
  }

  return data;
}

export function createResource(payload) {
  return request("/resources", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export function getResource(id) {
  return request(`/resources/${id}`);
}

export function updateResource(id, payload) {
  return request(`/resources/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export function deleteResource(id) {
  return request(`/resources/${id}`, { method: "DELETE" });
}

export function getResources(filters = {}) {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, value);
    }
  });

  const query = params.toString();
  return request(`/resources${query ? `?${query}` : ""}`);
}

export function getResourceReviews(filters = {}) {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, value);
    }
  });

  const query = params.toString();
  return request(`/resources/reviews${query ? `?${query}` : ""}`);
}

export function createResourceReview(resourceId, payload) {
  return request(`/resources/${resourceId}/reviews`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

async function readJson(response) {
  try {
    return await response.json();
  } catch {
    return {};
  }
}
