import isEqual from 'lodash/isEqual'
import { useState } from 'react'

import { useLocationParams } from 'services/navigation'

import { displayTypeParameter } from '../constants'

const descOrder = [{ id: 'misses', desc: true }]
const ascOrder = [{ id: 'name', desc: false }]

export function useTableDefaultSort(locationParams = {}) {
  const { params } = useLocationParams(locationParams)
  const [displayType, setDisplayType] = useState(params?.displayType)

  const [sortBy, setSortBy] = useState(() => {
    if (params?.displayType === displayTypeParameter.list.toLowerCase()) {
      return descOrder
    }
    return ascOrder
  })

  if (params?.displayType !== displayType) {
    if (
      params?.displayType === displayTypeParameter.list.toLowerCase() &&
      !isEqual(sortBy, descOrder)
    ) {
      setSortBy(descOrder)
    } else if (!isEqual(sortBy, ascOrder)) {
      setSortBy(ascOrder)
    }

    setDisplayType(params?.displayType)
  }

  return [sortBy, setSortBy]
}
