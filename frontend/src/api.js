async function request(path) {
  let response;
  try {
    response = await fetch(path);
  } catch {
    throw new Error("Could not reach the VayuVision API. Check that the backend is running.");
  }

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(result.error || "The weather service could not complete the request.");
  }
  return result;
}

export function searchIndianLocations(query) {
  return request(`/api/locations?query=${encodeURIComponent(query)}`);
}

export function getForecast(location) {
  const params = new URLSearchParams({
    latitude: String(location.latitude),
    longitude: String(location.longitude),
  });
  return request(`/api/weather?${params}`);
}
