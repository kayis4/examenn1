import { BASE_URL, TIEMPO_MAXIMO_MS } from './config.js';
import { ErrorApi } from './errores.js';
import { obtenerToken, olvidarSesion } from './auth.js';

export async function request(ruta, opciones = {}) {
  const url = `${BASE_URL.replace(/\/$/, '')}/${ruta.replace(/^\/+/, '')}`;
  const headers = new Headers(opciones.headers ?? {});
  headers.set('Accept', 'application/json');

  const token = obtenerToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);

  let body = opciones.body;
  if (body && typeof body === 'object' && !(body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
    body = JSON.stringify(body);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIEMPO_MAXIMO_MS);

  try {
    const response = await fetch(url, {
      ...opciones,
      headers,
      body,
      signal: controller.signal,
    });

    if (response.status === 204) return null;

    const datos = await response.json().catch(() => ({}));
    if (!response.ok) {
      if (response.status === 401) {
        olvidarSesion();
        window.location.reload();
      }
      throw new ErrorApi(response.status, datos);
    }
    return datos;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new ErrorApi(408, { message: 'La petición tardó demasiado tiempo.' });
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}
