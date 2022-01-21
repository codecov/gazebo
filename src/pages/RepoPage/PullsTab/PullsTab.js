import { useState, useLayoutEffect } from 'react'
import { useParams } from 'react-router'

import { usePulls } from 'services/pulls'
import MultiSelect from 'ui/MultiSelect'
import Select from 'ui/Select'

import { useSetCrumbs } from '../context'
import PullsTable from './PullsTable'
import { orderItems, fitlerItems, orderingEnum, stateEnum } from './enums'

// Moved during merge I'll likely consolodate this
function useFormControls() {
  const { provider, owner, repo } = useParams()

  const [pullsFilter, setPullsFilter] = useState([])
  const [pullsOrder, setPullsOrder] = useState([orderingEnum.Newest.name])

  const [pullsStates, setPullsStates] = useState([])
  const [orderingDirection, setOrderingDirection] = useState(
    orderingEnum.Newest.order
  )

  const { data: pulls } = usePulls({
    provider,
    owner,
    repo,
    filters: {
      state: pullsStates,
    },
    orderingDirection,
  })

  return {
    setPullsStates,
    setPullsOrder,
    setPullsFilter,
    pulls,
    setOrderingDirection,
    pullsFilter,
    pullsOrder,
  }
}

function PullsTab() {
  const setCrumbs = useSetCrumbs()
  const {
    setPullsStates,
    setPullsOrder,
    setPullsFilter,
    pulls,
    setOrderingDirection,
    pullsFilter,
    pullsOrder,
  } = useFormControls()

  useLayoutEffect(() => {
    setCrumbs()
  }, [setCrumbs])

  const handleOrderChange = (ordering) => {
    setPullsOrder(ordering)

    const { order } = orderingEnum[ordering]
    setOrderingDirection(order)
  }

  const handleFilterChange = (filters) => {
    setPullsFilter(filters)

    const states = filters.map((filter) => {
      const { state } = stateEnum[filter]
      return state
    })
    setPullsStates(states)
  }
  return (
    <div className="flex-1 flex flex-col gap-4">
      <div className="flex flex-row gap-3">
        <div className="flex gap-3 justify-center items-center">
          <label className="font-semibold text-sm">View:</label>
          <div>
            <MultiSelect
              ariaName="Filter by state"
              selectedItems={pullsFilter}
              items={fitlerItems}
              onChange={handleFilterChange}
              resourceName=""
            />
          </div>
        </div>
        <div className="flex gap-3 justify-center items-center">
          <label className="font-semibold text-sm ">Sort by:</label>
          <div>
            <Select
              value={pullsOrder}
              items={orderItems}
              onChange={handleOrderChange}
            />
          </div>
        </div>
      </div>
      <PullsTable pulls={pulls} />
    </div>
  )
}

export default PullsTab
