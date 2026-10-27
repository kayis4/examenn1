<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\GuardarEquipoRequest;
use App\Http\Resources\EquipoResource;
use App\Models\Equipo;
use App\Services\EquipoService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class EquipoController extends Controller
{
    protected $equipoService;

    public function __construct(EquipoService $equipoService)
    {
        $this->equipoService = $equipoService;
    }

    public function index(Request $request)
    {
        $q = $request->query('q');
        $estado = $request->query('estado');
        // Tope máximo de 50 en per_page según los requerimientos
        $porPagina = min((int) $request->query('por_pagina', 10), 50);

        $equipos = $this->equipoService->listar($q, $estado, $porPagina);

        return EquipoResource::collection($equipos);
    }

    public function store(GuardarEquipoRequest $request)
    {
        $equipo = $this->equipoService->crear($request->validated());

        return (new EquipoResource($equipo))
            ->response()
            ->setStatusCode(Response::HTTP_CREATED)
            ->header('Location', route('equipos.show', $equipo));
    }

    public function show(Equipo $equipo)
    {
        return new EquipoResource($equipo->load('categoria'));
    }

    public function update(GuardarEquipoRequest $request, Equipo $equipo)
    {
        $equipoActualizado = $this->equipoService->actualizar($equipo, $request->validated());

        return new EquipoResource($equipoActualizado);
    }

    public function destroy(Equipo $equipo)
    {
        $this->equipoService->eliminar($equipo);

        return response()->json(null, Response::HTTP_NO_CONTENT);
    }

    public function prestar(Equipo $equipo)
    {
        $equipoPrestado = $this->equipoService->prestar($equipo);

        return new EquipoResource($equipoPrestado);
    }
}