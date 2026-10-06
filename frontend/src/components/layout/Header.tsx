"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Upload, LayoutDashboard, User, Menu, LogOut, Search, Activity } from 'lucide-react';
import { useUserStore } from '@/store/useUserStore';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function Header() {
  const pathname = usePathname();
  const { isAuthenticated, profile, logout } = useUserStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/scan', label: 'Upload Prescription', icon: Upload },
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md">
            <Activity size={20} />
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-800">
            MediScript<span className="text-blue-600">AI</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-blue-600 ${
                  isActive ? 'text-blue-600' : 'text-slate-600'
                }`}
              >
                <Icon size={16} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Section (Search & Auth) */}
        <div className="hidden md:flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search medicines..."
              className="w-48 pl-9 pr-4 py-1.5 bg-slate-100 border-transparent focus:bg-white focus:border-blue-300 focus:ring-2 focus:ring-blue-100 rounded-full text-sm outline-none transition-all"
            />
          </div>

          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center gap-2 hover:bg-slate-100 p-2 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold">
                  {profile?.name?.charAt(0) || 'U'}
                </div>
                <span className="text-sm font-medium text-slate-700">{profile?.name || 'User'}</span>
              </button>

              <AnimatePresence>
                {isMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-2"
                  >
                    <Link href="/profile" className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50" onClick={() => setIsMenuOpen(false)}>
                      <User size={16} /> Medical Profile
                    </Link>
                    <button
                      onClick={() => { logout(); setIsMenuOpen(false); }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 text-left"
                    >
                      <LogOut size={16} /> Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                Log In
              </Link>
              <Link href="/register" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full text-sm font-medium transition-all shadow-md">
                Register
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button className="md:hidden p-2 text-slate-600" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          <Menu size={24} />
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden bg-white border-b border-slate-100 overflow-hidden"
          >
            <div className="px-4 py-4 flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-3 text-slate-700 font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <link.icon size={20} className="text-slate-400" />
                  {link.label}
                </Link>
              ))}
              <div className="h-px bg-slate-100 my-2"></div>
              {isAuthenticated ? (
                <>
                  <Link href="/profile" className="flex items-center gap-3 text-slate-700 font-medium" onClick={() => setIsMenuOpen(false)}>
                    <User size={20} className="text-slate-400" /> Medical Profile
                  </Link>
                  <button onClick={() => { logout(); setIsMenuOpen(false); }} className="flex items-center gap-3 text-red-600 font-medium w-full text-left">
                    <LogOut size={20} /> Logout
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-3">
                  <Link href="/login" className="flex justify-center bg-slate-100 text-slate-700 py-2.5 rounded-lg font-medium" onClick={() => setIsMenuOpen(false)}>
                    Log In
                  </Link>
                  <Link href="/register" className="flex justify-center bg-blue-600 text-white py-2.5 rounded-lg font-medium" onClick={() => setIsMenuOpen(false)}>
                    Register
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
