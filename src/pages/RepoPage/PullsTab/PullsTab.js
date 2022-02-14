import { useState, useLayoutEffect } from 'react'
import { useParams } from 'react-router'
import { useLocationParams } from 'services/navigation'

import { usePulls } from 'services/pulls'
import MultiSelect from 'ui/MultiSelect'
import Select from 'ui/Select'

import { useSetCrumbs } from '../context'
import PullsTable from './PullsTable'
import {
  orderItems,
  fitlerItems,
  orderingEnum,
  stateEnum,
  orderNames,
  stateNames,
} from './enums'

const defaultParams = {
  order: orderingEnum.Newest.order,
  prStates: [],
}

const useParamsStatesAndOrder = () => {
  const { params, updateParams } = useLocationParams(defaultParams)

  const { order, prStates } = params
  const paramOrderName = orderNames[order]

  const paramStatesNames = prStates.map((filter) => {
    const stateName = stateNames[filter]
    return stateName
  })
  return { paramOrderName, paramStatesNames, prStates, order, updateParams }
}

// Moved during merge I'll likely consolodate this
function useFormControls() {
  const { provider, owner, repo } = useParams()
  const { paramOrderName, paramStatesNames, prStates, order, updateParams } =
    useParamsStatesAndOrder()

  const [selectedStates, setSelectedStates] = useState(paramStatesNames)
  const [selectedOrder, setSelectedOrder] = useState(paramOrderName)

  const { data: pulls } = usePulls({
    provider,
    owner,
    repo,
    filters: {
      state: prStates,
    },
    orderingDirection: order,
  })

  return {
    setSelectedOrder,
    setSelectedStates,
    pulls,
    selectedStates,
    selectedOrder,
    updateParams,
  }
}

function PullsTab() {
  const setCrumbs = useSetCrumbs()
  const {
    setSelectedOrder,
    setSelectedStates,
    pulls,
    selectedStates,
    selectedOrder,
    updateParams,
  } = useFormControls()

  useLayoutEffect(() => {
    setCrumbs()
  }, [setCrumbs])

  const handleOrderChange = (selectedOrder) => {
    setSelectedOrder(selectedOrder)

    const { order } = orderingEnum[selectedOrder]
    updateParams({ order })
  }

  const handleStatesChange = (selectedStates) => {
    setSelectedStates(selectedStates)

    const prStates = selectedStates.map((filter) => {
      const { state } = stateEnum[filter]
      return state
    })
    updateParams({ prStates })
  }
  return (
    <div className="flex-1 flex flex-col gap-4">
      <div className="flex flex-row gap-3">
        <div className="flex gap-3 justify-center items-center">
          <label className="font-semibold text-sm">View:</label>
          <div>
            <MultiSelect
              ariaName="Filter by state"
              selectedItems={selectedStates}
              items={fitlerItems}
              onChange={handleStatesChange}
              resourceName=""
            />
          </div>
        </div>
        <div className="flex gap-3 justify-center items-center">
          <label className="font-semibold text-sm ">Sort by:</label>
          <div>
            <Select
              value={selectedOrder}
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
