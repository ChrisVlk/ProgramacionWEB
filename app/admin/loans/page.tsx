'use client';

import React, { useState } from 'react';
import { ProtectedLayout } from '@/components/protected-layout';
import { AppHeader } from '@/components/app-header';
import { MOCK_LOAN_REQUESTS } from '@/lib/mock-data';
import { LoanRequest } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { 
  BarChart3, 
  Package,
  FileText,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';

export default function AdminLoansPage() {
  const [loans, setLoans] = useState<LoanRequest[]>(MOCK_LOAN_REQUESTS);
  const [selectedLoan, setSelectedLoan] = useState<LoanRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);

  const handleApprove = (loan: LoanRequest) => {
    setSelectedLoan(loan);
    setActionType('approve');
    setActionDialogOpen(true);
  };

  const handleReject = (loan: LoanRequest) => {
    setSelectedLoan(loan);
    setActionType('reject');
    setActionDialogOpen(true);
  };

  const confirmAction = () => {
    if (!selectedLoan) return;

    if (actionType === 'approve') {
      setLoans(loans.map(loan =>
        loan.id === selectedLoan.id ? { ...loan, status: 'approved' } : loan
      ));
    } else if (actionType === 'reject') {
      setLoans(loans.map(loan =>
        loan.id === selectedLoan.id
          ? { ...loan, status: 'rejected', notes: rejectionReason }
          : loan
      ));
    }

    setActionDialogOpen(false);
    setSelectedLoan(null);
    setRejectionReason('');
    setActionType(null);
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
    { label: 'Dashboard', href: '/admin', icon: <BarChart3 className="w-4 h-4" /> },
    { label: 'Equipos', href: '/admin/equipment', icon: <Package className="w-4 h-4" /> },
    { label: 'Préstamos', href: '/admin/loans', icon: <FileText className="w-4 h-4" /> },
    { label: 'Sanciones', href: '/admin/sanctions', icon: <AlertTriangle className="w-4 h-4" /> },
  ];

  const pendingLoans = loans.filter(l => l.status === 'pending');
  const otherLoans = loans.filter(l => l.status !== 'pending');

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

          {/* Pending Requests Section */}
          {pendingLoans.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-foreground mb-4">Solicitudes Pendientes ({pendingLoans.length})</h3>
              <div className="grid gap-4">
                {pendingLoans.map((loan) => (
                  <Card key={loan.id} className="border-yellow-200 dark:border-yellow-800">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{loan.equipmentName}</CardTitle>
                          <CardDescription className="text-sm mt-1">
                            Solicitante: {loan.studentName} • ID: {loan.id}
                          </CardDescription>
                        </div>
                        <Badge className={getStatusColor(loan.status)}>
                          Pendiente
                        </Badge>
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
                          <p className="text-xs font-semibold text-muted-foreground uppercase">Días de Préstamo</p>
                          <p className="text-sm text-foreground">
                            {Math.ceil((new Date(loan.dueDate).getTime() - new Date(loan.requestDate).getTime()) / (1000 * 60 * 60 * 24))}
                          </p>
                        </div>
                      </div>
                      {loan.notes && (
                        <div className="mb-4 p-3 bg-muted rounded-lg">
                          <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Notas</p>
                          <p className="text-sm text-foreground">{loan.notes}</p>
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleApprove(loan)}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white gap-2"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Aprobar
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleReject(loan)}
                          className="flex-1 gap-2 bg-white hover:bg-red-600 hover:text-white border-red-600 text-red-600"
                        >
                          <XCircle className="w-4 h-4" />
                          Rechazar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Other Requests Section */}
          {otherLoans.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-4">Histórico ({otherLoans.length})</h3>
              <div className="grid gap-4">
                {otherLoans.map((loan) => (
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
                          {loan.status === 'approved' && 'Aprobado'}
                          {loan.status === 'rejected' && 'Rechazado'}
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
                          <p className="text-sm text-foreground capitalize">{loan.status}</p>
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

      {/* Action Dialog */}
      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approve' ? 'Aprobar Solicitud' : 'Rechazar Solicitud'}
            </DialogTitle>
            <DialogDescription>
              {selectedLoan?.equipmentName}
            </DialogDescription>
          </DialogHeader>

          {actionType === 'reject' && (
            <div className="space-y-2">
              <label htmlFor="reason" className="text-sm font-semibold">Motivo del Rechazo</label>
              <Textarea
                id="reason"
                placeholder="Explica por qué se rechaza esta solicitud..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="border-input resize-none"
                rows={4}
              />
            </div>
          )}

          {actionType === 'approve' && (
            <div className="py-4 text-center text-muted-foreground">
              ¿Estás seguro de que deseas aprobar esta solicitud?
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setActionDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={confirmAction}
              className={actionType === 'approve'
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-red-600 hover:bg-red-700 text-white'
              }
            >
              {actionType === 'approve' ? 'Aprobar' : 'Rechazar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ProtectedLayout>
  );
}
