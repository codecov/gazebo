import PropTypes from 'prop-types'

import Table from 'old_ui/Table'
import Spinner from 'ui/Spinner'
import TotalsNumber from 'ui/TotalsNumber'

import ComponentsNotConfigured from './ComponentsNotConfigured'
import { useComponentComparison } from './hooks'

const tableColumns = [
  {
    id: 'name',
    header: <span>Name</span>,
    accessorKey: 'name',
    width: 'w-3/12',
    cell: (info) => info.getValue(),
    justifyStart: true,
  },
  {
    id: 'headCoverage',
    header: <span className="w-full text-right">HEAD %</span>,
    accessorKey: 'headCoverage',
    width: 'w-7/12 justify-end',
    cell: (info) => info.getValue(),
  },
  {
    id: 'patchCoverage',
    header: <span className="w-full text-right">Patch %</span>,
    accessorKey: 'patchCoverage',
    width: 'w-28 justify-end',
    cell: (info) => info.getValue(),
  },
  {
    id: 'changeCoverage',
    header: <span className="w-full text-right">Change</span>,
    accessorKey: 'changeCoverage',
    width: 'w-1/12 justify-end',
    cell: (info) => info.getValue(),
  },
]

const Loader = ({ isLoading }) => {
  return (
    isLoading && (
      <div className="flex flex-1 justify-center">
        <Spinner size={60} />
      </div>
    )
  )
}

Loader.propTypes = {
  isLoading: PropTypes.bool,
}

function getTableData(data) {
  return (
    data &&
    data.map((flagComparison) => {
      const { name, headTotals, baseTotals, patchTotals } = flagComparison

      const headCoverage = headTotals?.percentCovered
      const baseCoverage = baseTotals?.percentCovered
      const patchCoverage = patchTotals?.percentCovered
      const changeCoverage =
        headCoverage && baseCoverage && headCoverage - baseCoverage

      return {
        name: (
          <h2 key={name} className="w-full break-words">
            {name}
          </h2>
        ),
        headCoverage: <TotalsNumber value={headCoverage} plain light />,
        patchCoverage: <TotalsNumber value={patchCoverage} plain light />,
        changeCoverage: (
          <TotalsNumber
            value={changeCoverage}
            showChange
            data-testid="change-value"
            light
          />
        ),
      }
    })
  )
}

function ComponentsTab() {
  const { data, isLoading } = useComponentComparison()

  const componentComparisons =
    data?.pull?.compareWithBase?.componentComparisons || []

  const tableData = getTableData(componentComparisons)
  const isTableDataEmpty = tableData && tableData?.length <= 0

  if (isLoading) {
    return <Loader isLoading={isLoading} />
  }

  if (isTableDataEmpty) {
    return <ComponentsNotConfigured />
  }

  return <Table data={tableData} columns={tableColumns} />
}

export default ComponentsTab
