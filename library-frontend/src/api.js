
const BASE = (
    import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'
).replace(/\/$/, '');

export async function api(path, options = {}) {
  const response = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });

  const raw = await response.text();

  let data = null;

  if (raw) {
    try {
      data = JSON.parse(raw);
    } catch {
      data = raw;
    }
  }

  if (!response.ok) {
    const message =
        typeof data === 'string'
            ? data
            : data?.message ||
            data?.error ||
            `Request failed (${response.status})`;

    throw new Error(message);
  }

  return data;
}

export const get = path => api(path);

export const post = (path, body) =>
    api(path, {
      method: 'POST',
      body: JSON.stringify(body)
    });

export const put = (path, body) =>
    api(path, {
      method: 'PUT',
      body: JSON.stringify(body)
    });

export const del = path =>
    api(path, {
      method: 'DELETE'
    });
