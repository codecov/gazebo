import { OnChangeFn, SortingState } from '@tanstack/react-table'
import isEqual from 'lodash/isEqual'
import { useState } from 'react'

import { useLocationParams } from 'services/navigation/useLocationParams'

import { displayTypeParameter } from '../constants'

const descOrder: SortingState = [{ id: 'misses', desc: true }]
const ascOrder: SortingState = [{ id: 'name', desc: false }]

export function useTableDefaultSort(
  locationParams = {}
): [SortingState, OnChangeFn<SortingState>] {
  const { params }: { params: { displayType?: string } } =
    useLocationParams(locationParams)
  const paramsDisplayType = params?.displayType || ''

  const [displayType, setDisplayType] = useState<string>(paramsDisplayType)

  const [sortBy, setSortBy] = useState(() => {
    if (paramsDisplayType === displayTypeParameter.list.toLowerCase()) {
      return descOrder
    }
    return ascOrder
  })

  if (paramsDisplayType !== displayType) {
    if (
      paramsDisplayType === displayTypeParameter.list.toLowerCase() &&
      !isEqual(sortBy, descOrder)
    ) {
      setSortBy(descOrder)
    } else if (!isEqual(sortBy, ascOrder)) {
      setSortBy(ascOrder)
    }

    setDisplayType(paramsDisplayType)
  }

  return [sortBy, setSortBy]
}
