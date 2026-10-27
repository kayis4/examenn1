<?php

namespace Tests\Feature;

use App\Models\Categoria;
use App\Models\Equipo;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EquipoApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_crear_equipo_retorna_201_con_location()
    {
        $user = User::factory()->create();
        $categoria = Categoria::factory()->create();

        $response = $this->actingAs($user)->postJson('/api/equipos', [
            'codigo' => 'EQ-9999',
            'nombre' => 'Laptop de Prueba',
            'categoria_id' => $categoria->id,
            'estado' => 'disponible',
            'fecha_adquisicion' => '2025-01-01',
            'costo_interno' => 500.00,
        ]);

        $response->assertStatus(201)
                 ->assertHeader('Location')
                 ->assertJsonFragment(['codigo' => 'EQ-9999']);
    }

    public function test_validacion_falla_con_422()
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->postJson('/api/equipos', []);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['codigo', 'nombre', 'categoria_id', 'fecha_adquisicion', 'costo_interno']);
    }

    public function test_no_se_puede_eliminar_equipo_prestado_409()
    {
        $user = User::factory()->create();
        $categoria = Categoria::factory()->create();
        $equipo = Equipo::create([
            'codigo' => 'EQ-1000',
            'nombre' => 'Proyector',
            'categoria_id' => $categoria->id,
            'estado' => 'prestado',
            'fecha_adquisicion' => '2025-01-01',
            'costo_interno' => 100.00,
        ]);

        $response = $this->actingAs($user)->deleteJson("/api/equipos/{$equipo->id}");

        $response->assertStatus(409)
                 ->assertJsonFragment(['codigo' => 'REGLA_NEGOCIO']);
    }
}