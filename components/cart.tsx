'use client';

import React, { useState } from 'react';
import { useCart } from '@/lib/cart-context';
import { useAuth } from '@/lib/auth-context';
import { createLoan } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2, Trash2, ShoppingCart } from 'lucide-react';

export const Cart: React.FC = () => {
  const { cart, removeFromCart, clearCart } = useCart();
  const { user } = useAuth();
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (cart.length === 0) {
    return (
      <Card className="border-dashed border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950">
        <CardContent className="pt-12 pb-12 text-center">
          <ShoppingCart className="w-16 h-16 text-green-300 mx-auto mb-4" />
          <p className="text-foreground font-semibold mb-2">El carrito está vacío</p>
          <p className="text-sm text-muted-foreground">Agrega equipos desde el catálogo para crear una solicitud</p>
        </CardContent>
      </Card>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!user) {
      setError('Necesitas iniciar sesión para enviar la solicitud.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Tomar la fecha más lejana de devolución entre todos los items del carrito
      const latestDueDate = cart
        .map((item) => item.dueDate)
        .filter(Boolean)
        .sort()
        .at(-1);

      await createLoan({
        estudiante: Number(user.id),
        fecha_devolucion: latestDueDate,
        detalles: cart.map((item) => ({
          equipo: Number(item.equipment.id),
          cantidad: item.quantity,
        })),
      });

      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        clearCart();
      }, 2000);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'No se pudo enviar la solicitud.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="w-5 h-5" />
          Carrito de Préstamo
        </CardTitle>
        <CardDescription>
          {cart.length} {cart.length === 1 ? 'equipo' : 'equipos'} en el carrito
        </CardDescription>
      </CardHeader>
      <CardContent>
        {submitted ? (
          <div className="py-8 text-center space-y-4">
            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto" />
            <div>
              <p className="font-semibold text-foreground">Solicitud Enviada</p>
              <p className="text-sm text-muted-foreground">
                Tu solicitud de préstamo ha sido registrada. El administrador la revisará pronto.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Items List */}
            <div className="space-y-2 max-h-64 overflow-y-auto">
              <p className="text-sm font-semibold text-foreground mb-3">Equipos en el carrito:</p>
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start justify-between gap-3 p-3 bg-muted rounded-lg border border-border"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{item.name}</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                        Cantidad: {item.quantity}
                      </span>
                      <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-1 rounded">
                        Devolución: {new Date(item.dueDate).toLocaleDateString('es-NI')}
                      </span>
                    </div>
                    {item.notes && (
                      <p className="text-xs text-muted-foreground mt-2 italic">{item.notes}</p>
                    )}
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => removeFromCart(item.id)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">{error}</AlertDescription>
              </Alert>
            )}

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                Todos los equipos en el carrito se enviarán en una sola solicitud.
              </AlertDescription>
            </Alert>

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={clearCart}
                className="flex-1"
                disabled={isSubmitting}
              >
                Vaciar Carrito
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Enviando...' : 'Enviar Solicitud'}
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
};
