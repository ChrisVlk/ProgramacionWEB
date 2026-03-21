'use client';

import React from 'react';
import { ProtectedLayout } from '@/components/protected-layout';
import { AppHeader } from '@/components/app-header';
import { ReportsDownload } from '@/components/reports-download';
import { MOCK_EQUIPMENT, MOCK_LOAN_REQUESTS } from '@/lib/mock-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart3, 
  Settings, 
  Package,
  FileText,
  AlertTriangle
} from 'lucide-react';

export default function AdminDashboard() {
  const totalRequests = MOCK_LOAN_REQUESTS.length;
  const pendingRequests = MOCK_LOAN_REQUESTS.filter(r => r.status === 'pending').length;
  const totalEquipment = MOCK_EQUIPMENT.reduce((sum, eq) => sum + eq.total, 0);
  const availableEquipment = MOCK_EQUIPMENT.reduce((sum, eq) => sum + eq.available, 0);

  const navItems = [
    { label: 'Dashboard', href: '/admin', icon: <BarChart3 className="w-4 h-4" /> },
    { label: 'Equipos', href: '/admin/equipment', icon: <Package className="w-4 h-4" /> },
    { label: 'Préstamos', href: '/admin/loans', icon: <FileText className="w-4 h-4" /> },
    { label: 'Sanciones', href: '/admin/sanctions', icon: <AlertTriangle className="w-4 h-4" /> },
  ];

  return (
    <ProtectedLayout allowedRoles={['admin']}>
      <AppHeader title="Panel Administrativo" navItems={navItems} />

      <main className="min-h-screen bg-background lg:pl-72">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-foreground">Resumen</h2>
            <p className="text-muted-foreground">
              Vista general del sistema de préstamos
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="border border-green-200 dark:border-green-800 bg-gradient-to-br from-green-50 to-white dark:from-green-950 dark:to-slate-950 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-green-700 dark:text-green-300">
                  Total Equipos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">{totalEquipment}</p>
                <p className="text-xs text-green-600/70 dark:text-green-400/70 mt-1">
                  {availableEquipment} disponibles
                </p>
              </CardContent>
            </Card>

            <Card className="border border-green-200 dark:border-green-800 bg-gradient-to-br from-green-50 to-white dark:from-green-950 dark:to-slate-950 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-green-700 dark:text-green-300">
                  Total Solicitudes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">{totalRequests}</p>
                <p className="text-xs text-green-600/70 dark:text-green-400/70 mt-1">
                  {pendingRequests} pendientes
                </p>
              </CardContent>
            </Card>

            <Card className="border border-green-200 dark:border-green-800 bg-gradient-to-br from-green-50 to-white dark:from-green-950 dark:to-slate-950 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-green-700 dark:text-green-300">
                  Categorías
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {new Set(MOCK_EQUIPMENT.map(e => e.category)).size}
                </p>
                <p className="text-xs text-green-600/70 dark:text-green-400/70 mt-1">
                  tipos de equipos
                </p>
              </CardContent>
            </Card>

            <Card className="border border-green-200 dark:border-green-800 bg-gradient-to-br from-green-50 to-white dark:from-green-950 dark:to-slate-950 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-green-700 dark:text-green-300">
                  Tasa Disponibilidad
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {Math.round((availableEquipment / totalEquipment) * 100)}%
                </p>
                <p className="text-xs text-green-600/70 dark:text-green-400/70 mt-1">
                  equipos disponibles
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Requests */}
            <Card>
              <CardHeader>
                <CardTitle>Solicitudes Recientes</CardTitle>
                <CardDescription>
                  Últimas solicitudes de préstamo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {MOCK_LOAN_REQUESTS.slice(0, 3).map((request) => (
                    <div key={request.id} className="flex items-center justify-between pb-4 border-b border-border last:border-0">
                      <div>
                        <p className="font-semibold text-sm text-foreground">
                          {request.equipmentName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {request.studentName}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-semibold text-foreground">
                          Qty: {request.quantity}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(request.requestDate).toLocaleDateString('es-NI')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Equipment Status */}
            <Card>
              <CardHeader>
                <CardTitle>Estado de Equipos</CardTitle>
                <CardDescription>
                  Equipos por disponibilidad
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {MOCK_EQUIPMENT.slice(0, 3).map((eq) => {
                    const percentage = (eq.available / eq.total) * 100;
                    return (
                      <div key={eq.id}>
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-semibold text-foreground">
                            {eq.name}
                          </p>
                          <p className="text-xs font-semibold text-muted-foreground">
                            {eq.available}/{eq.total}
                          </p>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className={`h-full rounded-full transition-all ${
                              percentage > 50
                                ? 'bg-green-500'
                                : percentage > 25
                                ? 'bg-yellow-500'
                                : 'bg-red-500'
                            }`}
                            style={{ width: `${Math.max(percentage, 5)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Reports Section */}
          <div className="mt-8">
            <ReportsDownload />
          </div>
        </div>
      </main>
    </ProtectedLayout>
  );
}
