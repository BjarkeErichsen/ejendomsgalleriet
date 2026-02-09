'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

export function Navbar() {
  const { user, loading, signOut } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-700 rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-sm">EG</span>
            </div>
            <span className="text-lg font-bold text-gray-900 hidden sm:block">
              Ejendomsgalleriet
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/soeg?type=leje"
              className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Leje
            </Link>
            <Link
              href="/soeg?type=salg"
              className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Salg
            </Link>
            <Link
              href="/soeg?type=investering"
              className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Investering
            </Link>
            <Link
              href="/statistik"
              className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Statistik
            </Link>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            {loading ? (
              <div className="h-9 w-20 bg-gray-100 rounded-md animate-pulse" />
            ) : user ? (
              <>
                <Button variant="outline" size="sm" href="/opret">
                  Opret annonce
                </Button>
                <div className="relative group">
                  <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-700 rounded-md hover:bg-gray-50">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Min konto
                  </button>
                  <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                    <Link href="/mine-opslag" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      Mine opslag
                    </Link>
                    <Link href="/profil" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      Profil
                    </Link>
                    <button
                      onClick={signOut}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 border-t border-gray-100"
                    >
                      Log ud
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" href="/login">
                  Log ind
                </Button>
                <Button variant="primary" size="sm" href="/registrer">
                  Opret konto
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-gray-600 hover:text-gray-900"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={cn('md:hidden border-t border-gray-200', mobileOpen ? 'block' : 'hidden')}>
        <div className="px-4 py-3 space-y-1">
          <Link href="/soeg?type=leje" className="block px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md" onClick={() => setMobileOpen(false)}>
            Leje
          </Link>
          <Link href="/soeg?type=salg" className="block px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md" onClick={() => setMobileOpen(false)}>
            Salg
          </Link>
          <Link href="/soeg?type=investering" className="block px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md" onClick={() => setMobileOpen(false)}>
            Investering
          </Link>
          <Link href="/statistik" className="block px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md" onClick={() => setMobileOpen(false)}>
            Statistik
          </Link>
          <hr className="my-2" />
          {user ? (
            <>
              <Link href="/opret" className="block px-3 py-2 text-sm font-medium text-blue-700 hover:bg-gray-50 rounded-md" onClick={() => setMobileOpen(false)}>
                Opret annonce
              </Link>
              <Link href="/mine-opslag" className="block px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md" onClick={() => setMobileOpen(false)}>
                Mine opslag
              </Link>
              <Link href="/profil" className="block px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md" onClick={() => setMobileOpen(false)}>
                Profil
              </Link>
              <button
                onClick={() => { signOut(); setMobileOpen(false) }}
                className="block w-full text-left px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md"
              >
                Log ud
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="block px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md" onClick={() => setMobileOpen(false)}>
                Log ind
              </Link>
              <Link href="/registrer" className="block px-3 py-2 text-sm font-medium text-blue-700 hover:bg-gray-50 rounded-md" onClick={() => setMobileOpen(false)}>
                Opret konto
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
