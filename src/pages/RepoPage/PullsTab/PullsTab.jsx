import { lazy, Suspense, useLayoutEffect, useState } from 'react'

import { useLocationParams } from 'services/navigation'
import MultiSelect from 'ui/MultiSelect'
import Select from 'ui/Select'
import Spinner from 'ui/Spinner'

import {
  filterItems,
  orderingEnum,
  orderItems,
  orderNames,
  stateEnum,
  stateNames,
} from './enums'

import { useSetCrumbs } from '../context'

const PullsTable = lazy(() => import('./PullsTable'))

const Loader = (
  <div className="flex flex-1 justify-center">
    <Spinner size={60} />
  </div>
)

const defaultParams = {
  order: orderingEnum.Newest.order,
  prStates: [],
}

function useControlParams() {
  const { params, updateParams } = useLocationParams(defaultParams)
  const { order, prStates } = params
  const paramOrderName = orderNames[order]

  const paramStatesNames = prStates.map((filter) => {
    const stateName = stateNames[filter]
    return stateName
  })

  const [selectedOrder, setSelectedOrder] = useState(paramOrderName)
  const [selectedStates, setSelectedStates] = useState(paramStatesNames)

  return {
    updateParams,
    selectedOrder,
    setSelectedOrder,
    selectedStates,
    setSelectedStates,
  }
}

function PullsTab() {
  const setCrumbs = useSetCrumbs()

  const {
    updateParams,
    selectedOrder,
    setSelectedOrder,
    selectedStates,
    setSelectedStates,
  } = useControlParams()

  useLayoutEffect(() => {
    setCrumbs()
  }, [setCrumbs])

  const handleOrderChange = (selectedOrder) => {
    const { order } = orderingEnum[selectedOrder]
    setSelectedOrder(selectedOrder)
    updateParams({ order })
  }

  const handleStatesChange = (selectedStates) => {
    const prStates = selectedStates.map((filter) => {
      const { state } = stateEnum[filter]
      return state
    })
    setSelectedStates(prStates)
    updateParams({ prStates })
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex flex-row gap-3">
        <div className="flex items-center justify-center gap-3">
          <label className="text-sm font-semibold">View:</label>
          <div>
            <MultiSelect
              dataMarketing="pulls-filter-by-state"
              ariaName="Filter by state"
              value={selectedStates}
              items={filterItems}
              onChange={handleStatesChange}
              resourceName=""
            />
          </div>
        </div>
        <div className="flex items-center justify-center gap-3">
          <label className="text-sm font-semibold ">Sort by:</label>
          <div>
            <Select
              dataMarketing="pulls-sort-by-selector"
              ariaName="Sort order"
              value={selectedOrder}
              items={orderItems}
              onChange={handleOrderChange}
            />
          </div>
        </div>
      </div>
      <Suspense fallback={Loader}>
        <PullsTable />
      </Suspense>
    </div>
  )
}

export default PullsTab
