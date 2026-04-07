'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ProtectedLayout } from '@/components/protected-layout';
import { AppHeader } from '@/components/app-header';
import { EquipmentCardMinimal } from '@/components/equipment-card-minimal';
import { BorrowDialog } from '@/components/borrow-dialog';
import { Cart } from '@/components/cart';
import { useCart } from '@/lib/cart-context';
import { useAuth } from '@/lib/auth-context';
import { fetchEquipment } from '@/lib/api-client';
import { Equipment } from '@/lib/types';
import { Package, FileText } from 'lucide-react';

export default function StudentDashboard() {
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [borrowDialogOpen, setBorrowDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'catalog' | 'cart'>('catalog');
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  useCart();

  useEffect(() => {
    const view = searchParams.get('view');
    setActiveTab(view === 'cart' ? 'cart' : 'catalog');
  }, [searchParams]);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const equipmentData = await fetchEquipment();

        if (!isMounted) return;
        setEquipment(equipmentData);
      } catch (error) {
        if (!isMounted) return;
        setEquipment([]);
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

  const switchTab = (tab: 'catalog' | 'cart') => {
    setActiveTab(tab);
    if (tab === 'cart') {
      router.replace('/dashboard?view=cart');
      return;
    }
    router.replace('/dashboard');
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
          <div className="flex-1 overflow-y-auto px-8 py-8">
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
                    onClick={() => switchTab('catalog')}
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
