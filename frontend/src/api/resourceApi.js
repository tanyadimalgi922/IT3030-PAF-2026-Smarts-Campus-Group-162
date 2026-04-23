const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8081/api";

async function request(endpoint, options) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
  const data = await response.json();

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
