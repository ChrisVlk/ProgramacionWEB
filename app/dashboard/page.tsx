'use client';

import React, { useEffect, useState } from 'react';
import { ProtectedLayout } from '@/components/protected-layout';
import { AppHeader } from '@/components/app-header';
import { EquipmentCardMinimal } from '@/components/equipment-card-minimal';
import { BorrowDialog } from '@/components/borrow-dialog';
import { Cart } from '@/components/cart';
import { useCart } from '@/lib/cart-context';
import { useAuth } from '@/lib/auth-context';
import { fetchEquipment, fetchStudentLoans } from '@/lib/api-client';
import { Equipment, LoanRequest } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Package, FileText } from 'lucide-react';

export default function StudentDashboard() {
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [borrowDialogOpen, setBorrowDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('catalog');
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loanRequests, setLoanRequests] = useState<LoanRequest[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const { cart } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const [equipmentData, loansData] = await Promise.all([
          fetchEquipment(),
          fetchStudentLoans(),
        ]);

        if (!isMounted) return;
        setEquipment(equipmentData);
        setLoanRequests(loansData);
      } catch (error) {
        if (!isMounted) return;
        setEquipment([]);
        setLoanRequests([]);
      } finally {
        if (isMounted) {
          setLoadingData(false);
        }
      }
    };

    if (user) {
      loadData();
    } else {
      setLoadingData(false);
    }

    return () => {
      isMounted = false;
    };
  }, [user]);

  const handleBorrow = (equipment: Equipment) => {
    setSelectedEquipment(equipment);
    setBorrowDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'returned':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const navItems = [
    { label: 'Catálogo', href: '/dashboard', icon: <Package className="w-4 h-4" /> },
    { label: 'Mis Préstamos', href: '/dashboard/loans', icon: <FileText className="w-4 h-4" /> },
  ];

  return (
    <ProtectedLayout allowedRoles={['student']}>
      <AppHeader title="Catálogo de Equipos" navItems={navItems} />

      <main className="min-h-screen bg-background lg:pl-72">
        <div className="flex-1 flex flex-col overflow-hidden">
            {/* Top Right - Cart Icon */}
            <div className="bg-background border-b border-border px-8 py-4 flex justify-end">
              <button
                onClick={() => setActiveTab('cart')}
                className="relative p-2 hover:bg-muted rounded-lg transition-colors"
                title="Ver carrito"
              >
                <ShoppingCart className="w-6 h-6 text-foreground" />
                {cart.length > 0 && (
                  <span className="absolute top-0 right-0 bg-destructive text-destructive-foreground text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {cart.length}
                  </span>
                )}
              </button>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto px-8 py-8">
              {/* Catalog Tab */}
              {activeTab === 'catalog' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-3xl font-bold text-foreground mb-2">Equipo Disponible</h2>
                    <p className="text-muted-foreground">
                      Selecciona un equipo para agregarlo al carrito
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {equipment.map((equipment) => (
                      <EquipmentCardMinimal
                        key={equipment.id}
                        equipment={equipment}
                        onBorrow={handleBorrow}
                      />
                    ))}
                    {!loadingData && equipment.length === 0 && (
                      <div className="col-span-full text-center py-8 text-muted-foreground">
                        No hay equipos disponibles en este momento.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Requests Tab */}
              {activeTab === 'requests' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-3xl font-bold text-foreground mb-2">Mis Solicitudes</h2>
                    <p className="text-muted-foreground">
                      Historial de tus solicitudes de préstamo
                    </p>
                  </div>

                  <div className="space-y-4 max-w-4xl">
                    {loanRequests.map((request) => (
                      <Card key={request.id}>
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <CardTitle className="text-lg">{request.equipmentName}</CardTitle>
                              <CardDescription className="text-sm mt-1">
                                Solicitado: {new Date(request.requestDate).toLocaleDateString('es-NI')}
                              </CardDescription>
                            </div>
                            <Badge className={getStatusColor(request.status)}>
                              {request.status === 'pending' && 'Pendiente'}
                              {request.status === 'approved' && 'Aprobado'}
                              {request.status === 'rejected' && 'Rechazado'}
                              {request.status === 'returned' && 'Devuelto'}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs text-muted-foreground">Cantidad</p>
                              <p className="font-semibold text-foreground">{request.quantity}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Fecha de Devolución</p>
                              <p className="font-semibold text-foreground">
                                {new Date(request.dueDate).toLocaleDateString('es-NI')}
                              </p>
                            </div>
                          </div>
                          {request.notes && (
                            <div className="mt-3 pt-3 border-t border-border">
                              <p className="text-xs text-muted-foreground">Notas</p>
                              <p className="text-sm text-foreground">{request.notes}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                    {loanRequests.length === 0 && (
                      <div className="text-center py-12">
                        <p className="text-muted-foreground">No tienes solicitudes aún</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Cart Tab */}
              {activeTab === 'cart' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-3xl font-bold text-foreground mb-2">Mi Carrito de Préstamo</h2>
                      <p className="text-muted-foreground">
                        Revisa y envía tu solicitud de préstamo
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveTab('catalog')}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
                    >
                      ← Volver al Catálogo
                    </button>
                  </div>

                  <div className="max-w-2xl">
                    <Cart />
                  </div>
                </div>
              )}
            </div>
        </div>
      </main>

      <BorrowDialog
        equipment={selectedEquipment}
        open={borrowDialogOpen}
        onOpenChange={setBorrowDialogOpen}
      />
    </ProtectedLayout>
  );
}
