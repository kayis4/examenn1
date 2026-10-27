<?php

namespace App\Services;

use App\Exceptions\ReglaNegocioException;
use App\Models\Equipo;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

/**
 * Capa de negocio de equipos.
 *
 * Esta clase NO conoce HTTP: no use request(), response(), abort() ni códigos
 * de estado aquí. Cuando una regla del dominio lo impida, lance
 * ReglaNegocioException con un mensaje en español.
 */
class EquipoService
{
    /**
     * Listado paginado con la categoría cargada de forma anticipada (sin N+1),
     * ordenado por código. Filtros opcionales:
     *  - $q:     busca en código o nombre (coincidencia parcial)
     *  - $estado: filtra por estado exacto
     */
    public function listar(?string $q, ?string $estado, int $porPagina): LengthAwarePaginator
    {
        $query = Equipo::with('categoria')->orderBy('codigo');

        if ($q) {
            $query->where(function ($subquery) use ($q) {
                $subquery->where('codigo', 'like', "%{$q}%")
                         ->orWhere('nombre', 'like', "%{$q}%");
            });
        }

        if ($estado) {
            $query->where('estado', $estado);
        }

        return $query->paginate($porPagina);
    }

    public function crear(array $datos): Equipo
    {
        $equipo = Equipo::create($datos);
        return $equipo->load('categoria');
    }

    public function actualizar(Equipo $equipo, array $datos): Equipo
    {
        $equipo->update($datos);
        return $equipo->load('categoria');
    }

    public function eliminar(Equipo $equipo): void
    {
        // R1. No se puede eliminar un equipo que está prestado.
        if ($equipo->estado === 'prestado') {
            throw new ReglaNegocioException("No se puede eliminar un equipo prestado.");
        }

        $equipo->delete();
    }

    public function prestar(Equipo $equipo): Equipo
    {
        // R2. Solo se puede prestar un equipo disponible.
        if ($equipo->estado !== 'disponible') {
            if ($equipo->estado === 'prestado') {
                throw new ReglaNegocioException("El equipo ya se encuentra prestado.");
            }

            throw new ReglaNegocioException("No se puede prestar un equipo en mantenimiento.");
        }

        $equipo->estado = 'prestado';
        $equipo->save();

        return $equipo->load('categoria');
    }
}
