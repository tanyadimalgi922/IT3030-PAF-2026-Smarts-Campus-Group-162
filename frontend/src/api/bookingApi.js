const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8081/api";

async function request(endpoint, options) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
  const data = await readJson(response);

  if (!response.ok) {
    throw new Error(data.message || "Booking request failed.");
  }

  return data;
}

export function createBooking(payload) {
  return request("/bookings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export function getBookings(filters = {}) {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, value);
    }
  });

  const query = params.toString();
  return request(`/bookings${query ? `?${query}` : ""}`);
}

export function getBookingSlots(resourceId, date) {
  const params = new URLSearchParams({ resourceId, date });
  return request(`/bookings/slots?${params.toString()}`);
}

export function approveBooking(id, reason, adminName) {
  const params = new URLSearchParams({ adminName });
  return reviewBooking(`/bookings/${id}/approve?${params.toString()}`, reason);
}

export function rejectBooking(id, reason, adminName) {
  const params = new URLSearchParams({ adminName });
  return reviewBooking(`/bookings/${id}/reject?${params.toString()}`, reason);
}

export function cancelBooking(id, reason, userName) {
  const params = new URLSearchParams({ userName });
  return reviewBooking(`/bookings/${id}/cancel?${params.toString()}`, reason);
}

function reviewBooking(endpoint, reason) {
  return request(endpoint, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reason }),
  });
}

async function readJson(response) {
  try {
    return await response.json();
  } catch {
    return {};
  }
}
