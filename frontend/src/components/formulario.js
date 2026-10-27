import { crearEquipo, listarCategorias } from "../modules/equipos.js";
import { mostrarMensaje } from "./mensajes.js";

const $form = document.querySelector("#form-equipo");
const $selectCategoria = document.querySelector("#categoria_id");
const $btnGuardar = document.querySelector("#btn-guardar");

/**
 * TODO [F3] Formulario de registro de equipos.
 *
 * iniciarFormulario({ alGuardar }):
 *  1. Llene el <select id="categoria_id"> con listarCategorias()
 *     (cree cada <option> con createElement, value = id, texto = nombre).
 *  2. Al enviar el formulario (submit):
 *     - Evite el envío tradicional.
 *     - Limpie los errores anteriores: textContent de [data-error] y aria-invalid de los campos.
 *     - Construya el objeto con FormData. categoria_id y costo_interno deben ir como números.
 *     - Deshabilite #btn-guardar y cambie su texto a "Guardando…" mientras espera.
 *     - Llame a crearEquipo(datos).
 *     - Éxito: limpie el formulario, mostrarMensaje("exito", "Equipo <codigo> registrado.")
 *              y llame a alGuardar().
 *     - 422: por cada campo de error.datos.errors, escriba el PRIMER mensaje en
 *            el <p data-error="<campo>"> y marque el campo con aria-invalid="true".
 *     - Otro error: mostrarMensaje("error", ...).
 *     - Siempre (finally): rehabilite el botón y restaure su texto.
 */
export const iniciarFormulario = async ({ alGuardar }) => {
    // 1. Llenar el <select id="categoria_id"> con listarCategorias()
    if ($selectCategoria) {
        try {
            const respuesta = await listarCategorias();
            const categorias = Array.isArray(respuesta) ? respuesta : (respuesta.data || []);
            $selectCategoria.replaceChildren();
            const opcionInicial = document.createElement('option');
            opcionInicial.value = '';
            opcionInicial.textContent = 'Seleccione una categoría';
            $selectCategoria.appendChild(opcionInicial);

            categorias.forEach(cat => {
                const $option = document.createElement('option');
                $option.value = cat.id;
                $option.textContent = cat.nombre;
                $selectCategoria.appendChild($option);
            });
        } catch (error) {
            console.error("Error al cargar las categorías:", error);
        }
    }

    if (!$form) return;

    // 2. Al enviar el formulario (submit)
    $form.addEventListener("submit", async (e) => {
        e.preventDefault();

        // Limpiar errores anteriores
        document.querySelectorAll("[data-error]").forEach($p => {
            $p.textContent = "";
        });
        document.querySelectorAll("[aria-invalid]").forEach($el => {
            $el.removeAttribute("aria-invalid");
        });

        // Construir objeto con FormData y castear a números
        const formData = new FormData($form);
        const datos = {
            codigo: formData.get("codigo"),
            nombre: formData.get("nombre"),
            categoria_id: formData.get("categoria_id") ? Number(formData.get("categoria_id")) : "",
            fecha_adquisicion: formData.get("fecha_adquisicion"),
            costo_interno: formData.get("costo_interno") ? Number(formData.get("costo_interno")) : ""
        };
        const estado = formData.get("estado");
        if (estado) datos.estado = estado;

        const textoOriginal = $btnGuardar ? $btnGuardar.textContent : "Guardar";

        // Deshabilitar botón y cambiar texto
        if ($btnGuardar) {
            $btnGuardar.disabled = true;
            $btnGuardar.textContent = "Guardando...";
        }

        try {
            const respuesta = await crearEquipo(datos);
            const codigoEquipo = respuesta?.codigo || respuesta?.data?.codigo || datos.codigo;

            // Éxito
            $form.reset();
            mostrarMensaje("exito", `Equipo ${codigoEquipo} registrado.`);

            if (typeof alGuardar === "function") {
                alGuardar();
            }
        } catch (error) {
            if (error.status === 422 && error.datos?.errors) {
                const errores = error.datos.errors;
                Object.keys(errores).forEach(campo => {
                    const $errorP = document.querySelector(`[data-error="${campo}"]`);
                    const $campoInput = $form.querySelector(`[name="${campo}"]`);

                    if ($errorP) {
                        $errorP.textContent = errores[campo][0];
                    }
                    if ($campoInput) {
                        $campoInput.setAttribute("aria-invalid", "true");
                    }
                });
            } else {
                mostrarMensaje("error", error.message || "Ocurrió un error al registrar el equipo.");
            }
        } finally {
            // Siempre restaurar el botón
            if ($btnGuardar) {
                $btnGuardar.disabled = false;
                $btnGuardar.textContent = textoOriginal;
            }
        }
    });
};
