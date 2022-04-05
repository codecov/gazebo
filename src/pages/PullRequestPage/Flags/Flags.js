import { useParams } from 'react-router-dom'

import { useFlagsForComparePage } from 'services/flags'
import Table from 'ui/Table'
import TotalsNumber from 'ui/TotalsNumber'

import Card from '../Card'

const tableColumns = [
  {
    Header: <span>Name</span>,
    accessor: 'col1',
    width: 'w-4/12',
  },
  {
    Header: <span className="w-full text-right">HEAD %</span>,
    accessor: 'col2',
    width: 'w-3/12',
  },
  {
    Header: <span className="w-full text-right">Patch %</span>,
    accessor: 'col3',
    width: 'w-3/12',
  },
  {
    Header: <span className="w-full text-right">+/-</span>,
    accessor: 'col4',
    width: 'w-3/12',
  },
]

function getTableData(data) {
  return (
    data &&
    data.map((flag) => {
      const { name, headReportTotals, baseReportTotals, diffTotals } = flag

      const headCoverage = headReportTotals?.coverage
      const baseCoverage = baseReportTotals?.coverage
      const patchCoverage = diffTotals && diffTotals[5]
      const changeCoverage =
        headCoverage && baseCoverage && headCoverage - baseCoverage

      return {
        col1: <h2 key={name}>{name}</h2>,
        col2: <TotalsNumber value={headCoverage} plain />,
        col3: <TotalsNumber value={patchCoverage} plain />,
        col4: (
          <TotalsNumber
            value={changeCoverage}
            showChange
            data-testid="change-value"
          />
        ),
      }
    })
  )
}

function Flags() {
  const { owner, provider, repo, pullId: pullid } = useParams()
  const { data } = useFlagsForComparePage({
    provider,
    owner,
    repo,
    query: { pullid },
  })

  const tableData = getTableData(data)

  return (
    <Card title="Flags">
      <Table data={tableData} columns={tableColumns} />
    </Card>
  )
}

export default Flags
