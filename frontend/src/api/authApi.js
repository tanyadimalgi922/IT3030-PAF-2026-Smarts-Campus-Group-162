const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8081/api";

async function postAuth(endpoint, payload) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Request failed. Please check your details.");
  }

  return data;
}

export function login(payload) {
  return postAuth("/auth/login", payload);
}

export function registerStudent(payload) {
  return postAuth("/auth/register/student", payload);
}

export function registerTechnician(payload) {
  return postAuth("/auth/register/technician", payload);
}
