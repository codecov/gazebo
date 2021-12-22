import { usePulls } from 'services/pulls'
import PullsTable from './PullsTable'
import { useParams } from 'react-router'
import MultiSelect from 'ui/MultiSelect'
import { useState } from 'react'
import Select from 'ui/Select'
import { orderItems, fitlerItems, orderingEnum, stateEnum } from './enums'

function PullsPage() {
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

  const handleOrderChange = (ordering) => {
    setPullsOrder(ordering)

    const { order } = orderingEnum[ordering]
    setOrderingDirection(order)
  }

  const handleFilterChange = (filters) => {
    setPullsFilter(filters)

    const temp = filters.map((filter) => {
      const { state } = stateEnum[filter]
      return state
    })
    setPullsStates(temp)
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="flex flex-row center mb-4">
        <label className="font-semibold text-sm mr-4 mt-1">View:</label>
        <span className="w-32">
          <MultiSelect
            ariaName="Filter by state"
            selectedItems={pullsFilter}
            items={fitlerItems}
            onChange={handleFilterChange}
            resourceName=""
          />
        </span>
        <label className="font-semibold text-sm mx-4 mt-1">Sort by:</label>
        <span className="w-32">
          <Select
            value={pullsOrder}
            items={orderItems}
            onChange={handleOrderChange}
          />
        </span>
      </div>
      <PullsTable pulls={pulls} />
    </div>
  )
}

export default PullsPage
