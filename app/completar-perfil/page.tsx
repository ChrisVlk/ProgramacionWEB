'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { completarPerfilApi } from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function CompletarPerfilPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [carnet, setCarnet] = useState('');
  const [carrera, setCarrera] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const CARRERAS = [
    { value: 'LAF', label: 'Licenciatura Administrativa con Énfasis en Finanzas' },
    { value: 'LCM', label: 'Licenciatura Comercial con Énfasis en Mercadeo' },
    { value: 'IGI', label: 'Ingeniería en Gestión Industrial' },
    { value: 'ICE', label: 'Ingeniería Cibernética Electrónica' },
    { value: 'IME', label: 'Ingeniería Mecánica y Energías Renovables' },
    { value: 'IMS', label: 'Ingeniería Mecatrónica y Sistemas de Control' },
    { value: 'IEM', label: 'Ingeniería Electromédica' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!carnet || !carrera) {
      setError('Por favor llena ambos campos.');
      return;
    }

    const carnetRegex = /^\d{2}-[A-Za-z0-9\-]{5,}$/;
    if (!carnetRegex.test(carnet)) {
      setError('El formato del carnet es inválido. Debe comenzar con el año (ej: 23-) seguido de tu código.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await completarPerfilApi(carnet, carrera);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Error al guardar el perfil.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/40 flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Completar Perfil</CardTitle>
          <CardDescription>
            Como estudiante, necesitamos que ingreses tu número de carnet y carrera para poder realizar préstamos de equipo deportivo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="carnet">Número de Carnet</Label>
              <Input
                id="carnet"
                placeholder="Ej. 2026-0001U"
                value={carnet}
                onChange={(e) => setCarnet(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="carrera">Carrera</Label>
              <Select value={carrera} onValueChange={setCarrera} required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona tu carrera" />
                </SelectTrigger>
                <SelectContent>
                  {CARRERAS.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar y Continuar'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
