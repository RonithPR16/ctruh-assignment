import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'

type FilterState = {
  query: string
  gender: string[]
  colour: string[]
  type: string[]
  price: string[]
}

const normalize = (value: string) => value.trim().toLowerCase()

const parseList = (value: string | null) =>
  value
    ? value
        .split(',')
        .map((item) => normalize(item))
        .filter(Boolean)
    : []

export const useUrlFilters = () => {
  const [searchParams, setSearchParams] = useSearchParams()

  const filters = useMemo<FilterState>(() => {
    return {
      query: searchParams.get('q')?.trim() ?? '',
      gender: parseList(searchParams.get('gender')),
      colour: parseList(searchParams.get('colour')),
      type: parseList(searchParams.get('type')),
      price: parseList(searchParams.get('price')),
    }
  }, [searchParams])

  const updateParams = (updater: (params: URLSearchParams) => void) => {
    const nextParams = new URLSearchParams(searchParams)
    updater(nextParams)
    setSearchParams(nextParams, { replace: true })
  }

  const setQuery = (value: string) => {
    const nextValue = value.trim()
    updateParams((params) => {
      if (nextValue) {
        params.set('q', nextValue)
      } else {
        params.delete('q')
      }
    })
  }

  const toggleFilter = (key: keyof Omit<FilterState, 'query'>, value: string) => {
    const normalizedValue = normalize(value)
    updateParams((params) => {
      const current = parseList(params.get(key))
      const next = current.includes(normalizedValue)
        ? current.filter((item) => item !== normalizedValue)
        : [...current, normalizedValue]
      if (next.length) {
        params.set(key, next.join(','))
      } else {
        params.delete(key)
      }
    })
  }

  const clearAll = () => {
    updateParams((params) => {
      params.delete('q')
      params.delete('gender')
      params.delete('colour')
      params.delete('type')
      params.delete('price')
    })
  }

  return {
    filters,
    setQuery,
    toggleFilter,
    clearAll,
  }
}
