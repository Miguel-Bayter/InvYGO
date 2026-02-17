import { useQuery } from '@tanstack/react-query'
import { fetchArchetypes } from '../api'

export function useArchetypes() {
  return useQuery({
    queryKey: ['archetypes'],
    queryFn: fetchArchetypes,
    staleTime: Infinity, // archetype list rarely changes
  })
}
