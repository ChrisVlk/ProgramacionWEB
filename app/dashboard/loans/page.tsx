'use client';

import React, { useEffect, useState } from 'react';
import { ProtectedLayout } from '@/components/protected-layout';
import { AppHeader } from '@/components/app-header';
import { fetchStudentLoans } from '@/lib/api-client';
import { LoanRequest } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Home, FileCheck } from 'lucide-react';

interface LoanGroup {
  groupId: string;
  status: LoanRequest['status'];
  requestDate: Date;
  dueDate: Date;
  studentName: string;
  notes?: string;
  items: { equipmentName: string; quantity: number }[];
}

function groupLoans(loans: LoanRequest[]): LoanGroup[] {
  const map = new Map<string, LoanGroup>();

  for (const loan of loans) {
    const groupId = loan.loanGroupId ?? loan.id;

    if (!map.has(groupId)) {
      map.set(groupId, {
        groupId,
        status: loan.status,
        requestDate: loan.requestDate,
        dueDate: loan.dueDate,
        studentName: loan.studentName,
        notes: loan.notes,
        items: [],
      });
    }

    map.get(groupId)?.items.push({
      equipmentName: loan.equipmentName,
      quantity: loan.quantity,
    });
  }

  return Array.from(map.values());
}

export default function StudentLoansPage() {
  const [loans, setLoans] = useState<LoanRequest[]>([]);

  useEffect(() => {
    let isMounted = true;

    const loadLoans = async () => {
      try {
        const data = await fetchStudentLoans();
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

  const getStatusLabel = (status: LoanRequest['status']) => {
    switch (status) {
      case 'pending':
        return 'Pendiente';
      case 'approved':
        return 'Aprobado';
      case 'rejected':
        return 'Rechazado';
      case 'returned':
        return 'Devuelto';
      default:
        return status;
    }
  };

  const navItems = [
    { label: 'Catálogo', href: '/dashboard', icon: <Home className="w-4 h-4" /> },
    { label: 'Mis Préstamos', href: '/dashboard/loans', icon: <FileCheck className="w-4 h-4" /> },
  ];

  const groupedLoans = groupLoans(loans);

  return (
    <ProtectedLayout allowedRoles={['student']}>
      <AppHeader title="Mis Préstamos" navItems={navItems} />

      <main className="min-h-screen bg-background lg:pl-72">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-2">Mis Préstamos</h2>
            <p className="text-muted-foreground">
              Gestiona todas tus solicitudes de préstamo
            </p>
          </div>

          <div className="space-y-4">
            {groupedLoans.map((request) => (
              <Card key={request.groupId} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-lg">Solicitud #{request.groupId}</CardTitle>
                      <CardDescription className="text-sm mt-1">
                        Solicitado: {new Date(request.requestDate).toLocaleDateString('es-NI')}
                      </CardDescription>
                    </div>
                    <Badge className={getStatusColor(request.status)}>
                      {getStatusLabel(request.status)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Equipos solicitados</p>
                    <ul className="divide-y divide-border rounded-lg border">
                      {request.items.map((item, index) => (
                        <li key={`${request.groupId}-${item.equipmentName}-${index}`} className="flex items-center justify-between px-3 py-2 text-sm">
                          <span className="text-foreground font-medium">{item.equipmentName}</span>
                          <span className="text-muted-foreground">x{item.quantity}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase">Equipos</p>
                      <p className="text-lg font-bold text-foreground">{request.items.length}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase">Fecha Solicitud</p>
                      <p className="text-sm text-foreground">
                        {new Date(request.requestDate).toLocaleDateString('es-NI')}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase">Fecha Devolución</p>
                      <p className="text-sm text-foreground">
                        {new Date(request.dueDate).toLocaleDateString('es-NI')}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase">Solicitante</p>
                      <p className="text-sm text-foreground">{request.studentName}</p>
                    </div>
                  </div>
                  {request.notes && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Notas</p>
                      <p className="text-sm text-foreground">{request.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
            {groupedLoans.length === 0 && (
              <Card>
                <CardContent className="pt-8 pb-8 text-center">
                  <p className="text-muted-foreground mb-4">No tienes solicitudes de préstamo aún</p>
                  <a href="/dashboard" className="text-primary hover:underline text-sm font-semibold">
                    Ir al catálogo →
                  </a>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </ProtectedLayout>
  );
}
