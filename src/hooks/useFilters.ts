'use client'

import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { useCallback, useMemo } from 'react'
import type { SearchFilters } from '@/lib/types'
import { parseSearchParams, buildSearchParams } from '@/lib/utils'

export function useFilters() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const filters = useMemo(() => parseSearchParams(searchParams), [searchParams])

  const setFilters = useCallback(
    (newFilters: Partial<SearchFilters>) => {
      const merged = { ...filters, ...newFilters }
      // Reset page when filters change
      if (!newFilters.page) merged.page = undefined
      const params = buildSearchParams(merged)
      router.push(`${pathname}?${params.toString()}`)
    },
    [filters, router, pathname]
  )

  const resetFilters = useCallback(() => {
    router.push(pathname)
  }, [router, pathname])

  return { filters, setFilters, resetFilters }
}
