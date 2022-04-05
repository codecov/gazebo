import { useParams } from 'react-router-dom'

import { useFlagsForComparePage } from 'services/flags'
import A from 'ui/A'
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

function getCardInfo({ tableData, isTablePopulated }) {
  return {
    withFlags: {
      title: 'Flags',
      value: <Table data={tableData} columns={tableColumns} />,
    },
    withoutFlags: {
      title: (
        <div className="flex justify-between w-full">
          <span>Flags</span>
          <button className="text-ds-blue" onClick={handleOnDismiss}>
            Dismiss
          </button>
        </div>
      ),
      value: (
        <div className="flex flex-col">
          <h1>image</h1>
          <p>
            Flags feature is not yet configured. Learn how flags can
            <A hook="flags" to={{ pageName: 'flags' }}>
              help your team today
            </A>
            .
          </p>
        </div>
      ),
    },
  }[isTablePopulated]
}

function handleOnDismiss() {
  // pass
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
  const isTablePopulated = tableData.length > 0 ? 'withFlags' : 'withoutFlags'
  const { title, value } = getCardInfo({ tableData, isTablePopulated })

  return <Card title={title}>{value}</Card>
}

export default Flags
