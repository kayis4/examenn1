<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class GuardarEquipoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        // Obtenemos el equipo actual si estamos actualizando (PUT) para ignorarlo en la regla unique
        $equipoId = $this->route('equipo') ? $this->route('equipo')->id ?? $this->route('equipo') : null;

        return [
            'codigo' => [
                'required',
                'string',
                'max:20',
                'regex:/^EQ-\d{4}$/',
                Rule::unique('equipos', 'codigo')->ignore($equipoId),
            ],
            'nombre' => 'required|string|min:3|max:120',
            'categoria_id' => 'required|integer|exists:categorias,id',
            'estado' => 'sometimes|in:disponible,mantenimiento',
            'fecha_adquisicion' => 'required|date|before_or_equal:today',
            'costo_interno' => 'required|numeric|min:0',
        ];
    }

    public function messages(): array
    {
        return [
            'codigo.required' => 'El código del equipo es obligatorio.',
            'codigo.string' => 'El código debe ser una cadena de texto.',
            'codigo.max' => 'El código no puede tener más de 20 caracteres.',
            'codigo.regex' => 'El formato del código debe ser EQ-0000.',
            'codigo.unique' => 'Este código de equipo ya está registrado.',

            'nombre.required' => 'El nombre del equipo es obligatorio.',
            'nombre.min' => 'El nombre debe tener al menos 3 caracteres.',
            'nombre.max' => 'El nombre no puede tener más de 120 caracteres.',

            'categoria_id.required' => 'La categoría es obligatoria.',
            'categoria_id.integer' => 'La categoría debe ser un número entero.',
            'categoria_id.exists' => 'La categoría seleccionada no existe.',

            'estado.in' => 'El estado debe ser disponible o mantenimiento.',

            'fecha_adquisicion.required' => 'La fecha de adquisición es obligatoria.',
            'fecha_adquisicion.date' => 'La fecha de adquisición debe ser una fecha válida.',
            'fecha_adquisicion.before_or_equal' => 'La fecha de adquisición no puede ser una fecha futura.',

            'costo_interno.required' => 'El costo interno es obligatorio.',
            'costo_interno.numeric' => 'El costo interno debe ser un valor numérico.',
            'costo_interno.min' => 'El costo interno debe ser mayor o igual a 0.',
        ];
    }
}