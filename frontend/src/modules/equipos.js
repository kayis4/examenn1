import { request } from './api.js';

export const listarCategorias = () => request('/categorias');

export const listarEquipos = (pagina = 1, porPagina = 10, filtros = {}) => {
  const parametros = new URLSearchParams({
    page: String(pagina),
    per_page: String(porPagina),
    ...Object.fromEntries(Object.entries(filtros).filter(([, valor]) => valor !== '' && valor != null)),
  });
  return request(`/equipos?${parametros}`);
};

export const crearEquipo = (datos) => request('/equipos', {
  method: 'POST',
  body: datos,
});

export const eliminarEquipo = (id) => request(`/equipos/${encodeURIComponent(id)}`, {
  method: 'DELETE',
});
