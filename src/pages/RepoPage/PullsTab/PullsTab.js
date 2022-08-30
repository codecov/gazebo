import { useLayoutEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import { useLocationParams } from 'services/navigation'
import { usePulls } from 'services/pulls'
import Button from 'ui/Button'
import MultipleSelect from 'ui/MultipleSelect'
import Select from 'ui/Select'

import {
  filterItems,
  orderingEnum,
  orderItems,
  orderNames,
  stateEnum,
  stateNames,
} from './enums'
import PullsTable from './PullsTable'

import { useSetCrumbs } from '../context'

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

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = usePulls({
    provider,
    owner,
    repo,
    filters: {
      state: prStates,
    },
    orderingDirection: order,
  })

  const pulls = data?.pulls

  return {
    setSelectedOrder,
    setSelectedStates,
    pulls,
    selectedStates,
    selectedOrder,
    updateParams,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
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
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
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
          <div className="w-32">
            <MultipleSelect
              ariaName="Filter by state"
              items={filterItems}
              onChange={handleStatesChange}
              value={selectedStates}
            />
          </div>
        </div>
        <div className="flex gap-3 justify-center items-center">
          <label className="font-semibold text-sm ">Sort by:</label>
          <div>
            <Select
              ariaName="Sort order"
              value={selectedOrder}
              items={orderItems}
              onChange={handleOrderChange}
            />
          </div>
        </div>
      </div>
      <PullsTable pulls={pulls} />
      {hasNextPage && (
        <div className="flex-1 mt-4 flex justify-center">
          <Button
            hook="load-more"
            isLoading={isFetchingNextPage}
            onClick={fetchNextPage}
          >
            Load More
          </Button>
        </div>
      )}
    </div>
  )
}

export default PullsTab
