import { useContext } from 'react'

import { NavigationContext } from './context'

export function useNav() {
  return useContext(NavigationContext)
}
