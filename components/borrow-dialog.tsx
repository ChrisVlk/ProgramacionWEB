'use client';

import React, { useState } from 'react';
import { Equipment } from '@/lib/types';
import { useCart } from '@/lib/cart-context';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface BorrowDialogProps {
  equipment: Equipment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BorrowDialog({ equipment, open, onOpenChange }: BorrowDialogProps) {
  const { addToCart, cart } = useCart();
  const [quantity, setQuantity] = useState('1');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!equipment) return;

    // Agregar al carrito
    addToCart({
      id: equipment.id,
      name: equipment.name,
      category: equipment.category,
      quantity: parseInt(quantity),
      dueDate,
      notes,
      equipment,
    });

    setSubmitted(true);

    // Reset form after 2 seconds
    setTimeout(() => {
      setQuantity('1');
      setDueDate('');
      setNotes('');
      setSubmitted(false);
      onOpenChange(false);
    }, 2000);
  };

  if (!equipment) return null;

  const today = new Date().toISOString().split('T')[0];
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateStr = minDate.toISOString().split('T')[0];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Agregar al Carrito</DialogTitle>
          <DialogDescription>
            {equipment.name}
          </DialogDescription>
        </DialogHeader>

        {submitted ? (
          <div className="py-8 text-center space-y-4">
            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto" />
            <div>
              <p className="font-semibold text-foreground">Agregado al Carrito</p>
              <p className="text-sm text-muted-foreground">
                El equipo ha sido agregado. Puedes continuar agregando más equipos o proceder al carrito.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Cantidad</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                max={equipment.available}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="border-input"
                required
              />
              <p className="text-xs text-muted-foreground">
                Disponible: {equipment.available} unidades
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="due-date">Fecha de Devolución</Label>
              <Input
                id="due-date"
                type="date"
                min={minDateStr}
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="border-input"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notas (Opcional)</Label>
              <Textarea
                id="notes"
                placeholder="¿Para qué actividad necesitas el equipo?"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="border-input resize-none"
                rows={3}
              />
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                Asegúrate de devolver el equipo en condiciones adecuadas.
              </AlertDescription>
            </Alert>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Agregar al Carrito
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
