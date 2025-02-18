import { Suspense, useCallback, useLayoutEffect, useState } from 'react'

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
import PullsTable from './PullsTable'

import { useCrumbs } from '../context'

const Loader = () => (
  <div className="flex flex-1 justify-center">
    <Spinner />
  </div>
)

type Order = keyof typeof orderNames
type SelectedStatesNames = Array<(typeof stateNames)[keyof typeof stateNames]>
type SelectedStatesEnum = Array<
  (typeof stateEnum)[keyof typeof stateEnum]['state']
>

const defaultParams = {
  order: orderingEnum.Newest.order,
  prStates: [],
}

function useControlParams() {
  const { params, updateParams } = useLocationParams(defaultParams)
  const { order, prStates } = params as {
    order: Order
    prStates: SelectedStatesEnum
  }
  const paramOrderName = orderNames[order]

  const paramStatesNames = prStates.map((filter) => {
    const stateName = stateNames[filter]
    return stateName
  })

  const [selectedOrder, setSelectedOrder] = useState(paramOrderName)
  const [selectedStates, setSelectedStates] =
    useState<SelectedStatesNames>(paramStatesNames)

  return {
    updateParams,
    selectedOrder,
    setSelectedOrder,
    selectedStates,
    setSelectedStates,
  }
}

function PullsTab() {
  const { setBreadcrumbs } = useCrumbs()

  useLayoutEffect(() => {
    setBreadcrumbs([])
  }, [setBreadcrumbs])

  const {
    updateParams,
    selectedOrder,
    setSelectedOrder,
    selectedStates,
    setSelectedStates,
  } = useControlParams()

  const handleOrderChange = useCallback(
    (selectedOrder: keyof typeof orderingEnum) => {
      const { order } = orderingEnum[selectedOrder]
      setSelectedOrder(selectedOrder)
      updateParams({ order })
    },
    [setSelectedOrder, updateParams]
  )

  const handleStatesChange = useCallback(
    (selectedStates: SelectedStatesNames) => {
      const states: SelectedStatesEnum = []
      const names: SelectedStatesNames = []

      for (const filter of selectedStates) {
        states.push(stateEnum[filter].state)
        names.push(stateEnum[filter].name)
      }

      setSelectedStates(names)
      updateParams({ prStates: states })
    },
    [setSelectedStates, updateParams]
  )

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex flex-row gap-3">
        <div className="flex items-center justify-center gap-3">
          <label className="text-sm font-semibold">View:</label>
          <div className="w-32">
            <MultiSelect
              // @ts-expect-error - need to play around with forward refs and types
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
              // @ts-expect-error - need to play around with forward refs and types
              dataMarketing="pulls-sort-by-selector"
              ariaName="Sort order"
              value={selectedOrder}
              items={orderItems}
              onChange={handleOrderChange}
            />
          </div>
        </div>
      </div>
      <Suspense fallback={<Loader />}>
        <PullsTable />
      </Suspense>
    </div>
  )
}

export default PullsTab
