import { useParams } from 'react-router-dom'

import { usePull } from 'services/pull'
import FlagsNotConfigured from 'shared/FlagsNotConfigured'
import Table from 'ui/Table'
import TotalsNumber from 'ui/TotalsNumber'

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

function Flags() {
  const { owner, repo, pullId, provider } = useParams()
  const { data } = usePull({ provider, owner, repo, pullId })
  const flagComparison = data?.pull?.compareWithBase?.flagComparisons || []

  const tableData = getTableData(flagComparison)
  const isTableDataEmpty = tableData && tableData?.length <= 0

  if (isTableDataEmpty) {
    return <FlagsNotConfigured />
  }

  return <Table data={tableData} columns={tableColumns} />
}

export default Flags
