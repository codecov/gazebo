import { useEffect, useState } from 'react'

import { useLocationParams } from 'services/navigation'

import { displayTypeParameter } from '../constants'

export function useTableDefaultSort(locationParams = {}) {
  const { params } = useLocationParams(locationParams)
  const [sortBy, setSortBy] = useState([])

  useEffect(() => {
    if (params?.displayType === displayTypeParameter.list.toLowerCase()) {
      setSortBy([{ id: 'misses', desc: true }])
    } else {
      setSortBy([{ id: 'name', desc: false }])
    }
  }, [params?.displayType])

  return [sortBy, setSortBy]
}
