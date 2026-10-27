import { listarEquipos, eliminarEquipo } from '../modules/equipos.js';
import { mostrarMensaje } from './mensajes.js';

const POR_PAGINA = 10;
let paginaActual = 1;
let lista;

export const formatearFecha = (iso) => iso
  ? new Date(`${iso}T00:00:00`).toLocaleDateString('es-CR', { day: 'numeric', month: 'short', year: 'numeric' })
  : '';

export async function cargarPagina(pagina = paginaActual) {
  if (!lista) return;
  const resumen = document.querySelector('#resumen');
  const paginaTexto = document.querySelector('#pagina-actual');
  const anterior = document.querySelector('#btn-anterior');
  const siguiente = document.querySelector('#btn-siguiente');
  lista.setAttribute('aria-busy', 'true');

  try {
    const respuesta = await listarEquipos(pagina, POR_PAGINA);
    const equipos = respuesta?.data ?? [];
    const meta = respuesta?.meta ?? {};
    const plantilla = document.querySelector('#tpl-equipo');
    lista.replaceChildren();

    if (equipos.length === 0) {
      if (pagina > 1) return await cargarPagina(pagina - 1);
      const vacio = document.createElement('li');
      vacio.className = 'vacio';
      vacio.textContent = 'No hay equipos registrados.';
      lista.append(vacio);
    } else {
      for (const equipo of equipos) {
        const tarjeta = plantilla.content.cloneNode(true);
        const item = tarjeta.querySelector('li');
        item.dataset.id = equipo.id;
        const estado = tarjeta.querySelector('.estado');
        estado.textContent = equipo.estado;
        estado.dataset.estado = equipo.estado;
        tarjeta.querySelector('.codigo').textContent = equipo.codigo;
        tarjeta.querySelector('.nombre').textContent = equipo.nombre;
        tarjeta.querySelector('.categoria').textContent = equipo.categoria?.nombre ?? 'Sin categoría';
        tarjeta.querySelector('.fecha').textContent = formatearFecha(equipo.fecha_adquisicion);
        lista.append(tarjeta);
      }
    }

    paginaActual = meta.current_page ?? pagina;
    if (resumen) resumen.textContent = `Mostrando ${meta.from ?? 0}–${meta.to ?? 0} de ${meta.total ?? 0}`;
    if (paginaTexto) paginaTexto.textContent = `Página ${paginaActual} de ${meta.last_page ?? 1}`;
    if (anterior) anterior.disabled = paginaActual <= 1;
    if (siguiente) siguiente.disabled = paginaActual >= (meta.last_page ?? 1);
  } catch (error) {
    mostrarMensaje('error', error.message || 'No fue posible cargar los equipos.');
  } finally {
    lista.removeAttribute('aria-busy');
  }
}

export function iniciarListado() {
  lista = document.querySelector('#lista-equipos');
  if (!lista) return;

  document.querySelector('#btn-anterior')?.addEventListener('click', () => cargarPagina(paginaActual - 1));
  document.querySelector('#btn-siguiente')?.addEventListener('click', () => cargarPagina(paginaActual + 1));

  lista.addEventListener('click', async (evento) => {
    const boton = evento.target.closest('.btn-eliminar');
    if (!boton) return;
    const item = boton.closest('li[data-id]');
    if (!item || !confirm('¿Está seguro de que desea eliminar este equipo?')) return;

    try {
      await eliminarEquipo(item.dataset.id);
      mostrarMensaje('exito', 'Equipo eliminado.');
      const quedabaUno = lista.querySelectorAll('li[data-id]').length === 1;
      await cargarPagina(quedabaUno && paginaActual > 1 ? paginaActual - 1 : paginaActual);
    } catch (error) {
      mostrarMensaje('error', error.status === 409
        ? (error.datos?.mensaje ?? 'No se puede eliminar este equipo.')
        : (error.message || 'Ocurrió un error al eliminar el equipo.'));
    }
  });

  cargarPagina(1);
}
