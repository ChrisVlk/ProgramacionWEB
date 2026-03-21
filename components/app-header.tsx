'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  BarChart3, 
  Settings, 
  LogOut, 
  Menu,
  X,
  Moon,
  Sun
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useState } from 'react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface AppHeaderProps {
  title: string;
  navItems: NavItem[];
}

export function AppHeader({ title, navItems }: AppHeaderProps) {
  const { logout, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-primary/30 bg-primary/95 text-primary-foreground backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="p-2 rounded-lg hover:bg-primary/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary lg:hidden"
              aria-label="Abrir menú"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <Image 
              src="/ESTRELLASALLE.png" 
              alt="Estrella La Salle" 
              width={32} 
              height={32}
              className="w-8 h-8"
            />
            <div>
              <h1 className="text-lg font-bold">GEAR</h1>
              <p className="text-xs text-primary-foreground/80">{title}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-lg hover:bg-primary/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
              aria-label="Cambiar tema"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <div className="hidden sm:flex flex-col text-right leading-tight">
              <span className="text-sm font-semibold">{user?.name}</span>
              <span className="text-xs text-primary-foreground/70 capitalize">{user?.role}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-72 border-r border-border bg-background text-foreground z-40 pt-20">
        <div className="h-full flex flex-col">
          <div className="px-6 pb-4">
            <p className="text-sm font-semibold text-muted-foreground">Navegación</p>
          </div>
          <nav className="flex-1 px-3 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 w-full rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  pathname === item.href
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:bg-muted'
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="px-4 py-4 border-t border-border">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="w-full flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted"
            >
              <span className="flex items-center gap-2">
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                {theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}
              </span>
              <span className="text-xs text-muted-foreground uppercase">{theme}</span>
            </button>

            <button
              onClick={handleLogout}
              className="mt-3 w-full flex items-center justify-center gap-2 rounded-lg border border-destructive/30 bg-destructive/15 px-3 py-2 text-sm font-medium text-destructive shadow-sm hover:bg-destructive/25"
            >
              <LogOut className="w-4 h-4" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </aside>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-72 max-w-full bg-background shadow-xl border-r border-border">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div>
                <p className="text-lg font-semibold text-foreground">Menú</p>
                <p className="text-xs text-muted-foreground">Navegación rápida</p>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-muted"
                aria-label="Cerrar menú"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="p-4 space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 w-full rounded-lg px-3 py-2 transition-colors ${
                    pathname === item.href
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground hover:bg-muted'
                  }`}
                >
                  {item.icon}
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
            </nav>

            <div className="p-4 border-t border-border space-y-2">
              <button
                onClick={() => {
                  setTheme(theme === 'dark' ? 'light' : 'dark');
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-between gap-2 rounded-lg px-3 py-2 hover:bg-muted text-foreground"
              >
                <span className="flex items-center gap-2">
                  {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                  {theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}
                </span>
                <span className="text-xs text-muted-foreground uppercase">{theme}</span>
              </button>

              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 rounded-lg border border-destructive/30 bg-destructive/15 px-3 py-2 text-destructive shadow-sm hover:bg-destructive/25"
              >
                <LogOut className="w-5 h-5" />
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
