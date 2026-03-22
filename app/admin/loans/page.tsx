'use client';

import React, { useEffect, useState } from 'react';
import { ProtectedLayout } from '@/components/protected-layout';
import { AppHeader } from '@/components/app-header';
import { fetchAdminLoans, markLoanAsReturned } from '@/lib/api-client';
import { LoanRequest } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  Package,
  FileText,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

export default function AdminLoansPage() {
  const [loans, setLoans] = useState<LoanRequest[]>([]);
  const [workingLoanId, setWorkingLoanId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadLoans = async () => {
      try {
        const data = await fetchAdminLoans();
        if (isMounted) {
          setLoans(data);
        }
      } catch {
        if (isMounted) {
          setLoans([]);
        }
      }
    };

    loadLoans();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleMarkReturned = async (loan: LoanRequest) => {
    if (!loan.loanGroupId) return;
    setWorkingLoanId(loan.loanGroupId);
    try {
      await markLoanAsReturned(loan.loanGroupId);
      const updated = await fetchAdminLoans();
      setLoans(updated);
    } finally {
      setWorkingLoanId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'returned':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const navItems = [
    { label: 'Dashboard', href: '/admin', icon: <BarChart3 className="w-4 h-4" /> },
    { label: 'Equipos', href: '/admin/equipment', icon: <Package className="w-4 h-4" /> },
    { label: 'Préstamos', href: '/admin/loans', icon: <FileText className="w-4 h-4" /> },
    { label: 'Sanciones', href: '/admin/sanctions', icon: <AlertTriangle className="w-4 h-4" /> },
  ];

  const activeLoans = loans.filter(l => l.status === 'approved' || l.status === 'pending');
  const returnedLoans = loans.filter(l => l.status === 'returned');

  return (
    <ProtectedLayout allowedRoles={['admin']}>
      <AppHeader title="Gestión de Préstamos" navItems={navItems} />

      <main className="min-h-screen bg-background lg:pl-72">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-foreground">Préstamos</h2>
            <p className="text-muted-foreground">
              Gestiona las solicitudes de préstamo
            </p>
          </div>

          {/* Active Requests Section */}
          {activeLoans.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-foreground mb-4">Préstamos Activos ({activeLoans.length})</h3>
              <div className="grid gap-4">
                {activeLoans.map((loan) => (
                  <Card key={loan.id} className="border-yellow-200 dark:border-yellow-800">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{loan.equipmentName}</CardTitle>
                          <CardDescription className="text-sm mt-1">
                            Solicitante: {loan.studentName} • ID: {loan.id}
                          </CardDescription>
                        </div>
                        <Badge className={getStatusColor(loan.status)}>{loan.status === 'pending' ? 'Atrasado' : 'Activo'}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground uppercase">Cantidad</p>
                          <p className="font-bold text-foreground">{loan.quantity}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground uppercase">Fecha Solicitud</p>
                          <p className="text-sm text-foreground">
                            {new Date(loan.requestDate).toLocaleDateString('es-NI')}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground uppercase">Fecha Devolución</p>
                          <p className="text-sm text-foreground">
                            {new Date(loan.dueDate).toLocaleDateString('es-NI')}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground uppercase">Estado backend</p>
                          <p className="text-sm text-foreground">
                            {loan.backendStatus || 'ACTIVO'}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleMarkReturned(loan)}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white gap-2"
                          disabled={!loan.loanGroupId || workingLoanId === loan.loanGroupId}
                        >
                          <CheckCircle className="w-4 h-4" />
                          {workingLoanId === loan.loanGroupId ? 'Actualizando...' : 'Marcar Devuelto'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Returned Requests Section */}
          {returnedLoans.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-4">Histórico ({returnedLoans.length})</h3>
              <div className="grid gap-4">
                {returnedLoans.map((loan) => (
                  <Card key={loan.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{loan.equipmentName}</CardTitle>
                          <CardDescription className="text-sm mt-1">
                            {loan.studentName} • ID: {loan.id}
                          </CardDescription>
                        </div>
                        <Badge className={getStatusColor(loan.status)}>
                          {loan.status === 'returned' && 'Devuelto'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground uppercase">Cantidad</p>
                          <p className="font-bold text-foreground">{loan.quantity}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground uppercase">Fecha Solicitud</p>
                          <p className="text-sm text-foreground">
                            {new Date(loan.requestDate).toLocaleDateString('es-NI')}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground uppercase">Fecha Devolución</p>
                          <p className="text-sm text-foreground">
                            {new Date(loan.dueDate).toLocaleDateString('es-NI')}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground uppercase">Estado</p>
                          <p className="text-sm text-foreground">{loan.backendStatus || 'DEVUELTO'}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {loans.length === 0 && (
            <Card>
              <CardContent className="pt-8 pb-8 text-center">
                <p className="text-muted-foreground">No hay solicitudes de préstamo</p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </ProtectedLayout>
  );
}
