import { useParams } from 'react-router-dom'

import { useFlagsForComparePage } from 'services/flags'
import Table from 'ui/Table'

import Card from '../Card'

const tableColumns = [
  {
    Header: <span>Name</span>,
    accessor: 'col1',
    width: 'w-5/12',
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
    width: 'w-2/12',
  },
]

function Flags() {
  const { owner, provider, repo, pullId: pullid } = useParams()
  const { data } = useFlagsForComparePage({
    provider,
    owner,
    repo,
    query: { pullid },
  })

  const tableData = data.map((flag, index) => {
    const { name, headReportTotals, baseReportTotals, diffTotals } = flag

    const headCoverage = headReportTotals?.coverage
    const baseCoverage = baseReportTotals?.coverage
    const patch = diffTotals && diffTotals[5]
    const change = headCoverage && baseCoverage && headCoverage - baseCoverage

    return {
      col1: <div key={index}>{name}</div>,
      col2: (
        <div key="b" className="w-full text-right">
          {headCoverage}
        </div>
      ),
      col3: (
        <div key="c" className="w-full text-right">
          {patch}
        </div>
      ),
      col4: (
        <div key="d" className="w-full text-right">
          {change}
        </div>
      ),
    }
  })

  return (
    <Card title="Flags">
      <Table data={tableData} columns={tableColumns} />
    </Card>
  )
}

export default Flags
