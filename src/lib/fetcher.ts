// Helper para realizar requests con manejo de errores
export async function fetcher<T>(url: string, options?: RequestInit): Promise<T> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
}

// GET request
export const get = <T>(url: string) => fetcher<T>(url);

// POST request
export const post = <T>(url: string, body: any) =>
  fetcher<T>(url, {
    method: 'POST',
    body: JSON.stringify(body),
  });

// PUT request
export const put = <T>(url: string, body: any) =>
  fetcher<T>(url, {
    method: 'PUT',
    body: JSON.stringify(body),
  });

// DELETE request
export const del = <T>(url: string) =>
  fetcher<T>(url, {
    method: 'DELETE',
  });
