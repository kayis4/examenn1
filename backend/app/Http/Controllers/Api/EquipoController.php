<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\GuardarEquipoRequest;
use App\Http\Resources\EquipoResource;
use App\Models\Equipo;
use App\Services\EquipoService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class EquipoController extends Controller
{
    public function __construct(private readonly EquipoService $equipoService)
    {
    }

    public function index(Request $request): AnonymousResourceCollection
    {
        $porPagina = min(max((int) $request->query('per_page', $request->query('por_pagina', 10)), 1), 50);
        return EquipoResource::collection($this->equipoService->listar(
            $request->query('q'), $request->query('estado'), $porPagina
        ));
    }

    public function store(GuardarEquipoRequest $request): JsonResponse
    {
        $equipo = $this->equipoService->crear($request->validated());

        return (new EquipoResource($equipo))
            ->response()
            ->setStatusCode(Response::HTTP_CREATED)
            ->header('Location', route('equipos.show', $equipo));
    }

    public function show(Equipo $equipo): EquipoResource
    {
        return new EquipoResource($equipo->load('categoria'));
    }

    public function update(GuardarEquipoRequest $request, Equipo $equipo): EquipoResource
    {
        $equipoActualizado = $this->equipoService->actualizar($equipo, $request->validated());

        return new EquipoResource($equipoActualizado);
    }

    public function destroy(Equipo $equipo): Response
    {
        $this->equipoService->eliminar($equipo);

        return response()->json(null, Response::HTTP_NO_CONTENT);
    }

    public function prestar(Equipo $equipo): EquipoResource
    {
        $equipoPrestado = $this->equipoService->prestar($equipo);

        return new EquipoResource($equipoPrestado);
    }
}
