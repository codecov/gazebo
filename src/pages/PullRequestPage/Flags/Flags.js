import { useState } from 'react'
import { useParams } from 'react-router-dom'

import flagManagement from 'assets/svg/flagManagement.svg'
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
      const patchCoverage = diffTotals?.coverage
      const changeCoverage =
        headCoverage && baseCoverage && headCoverage - baseCoverage

      return {
        col1: <h2 key={name}>{name}</h2>,
        col2: (
          <div className="w-full flex justify-end">
            <TotalsNumber value={headCoverage} plain light />
          </div>
        ),
        col3: (
          <div className="w-full flex justify-end">
            <TotalsNumber value={patchCoverage} plain light />
          </div>
        ),
        col4: (
          <div className="w-full flex justify-end">
            <TotalsNumber
              value={changeCoverage}
              showChange
              data-testid="change-value"
              light
            />
          </div>
        ),
      }
    })
  )
}

function handleOnDismiss(setIsCardDismissed) {
  setIsCardDismissed(true)
  localStorage.setItem('dismissFlagsCard', true)
}

function getCardInfo({ tableData, isDataPopulated, setIsCardDismissed }) {
  const isTablePopulated = isDataPopulated ? 'withFlags' : 'withoutFlags'
  return {
    withFlags: {
      // TODO: Add carryforward flag title here. This endpoint doesn't surface if a flag is CFF or not, so this would be a feature for the GQL implementation here
      title: 'Flags',
      value: <Table data={tableData} columns={tableColumns} />,
    },
    withoutFlags: {
      title: (
        <div className="flex justify-between w-full">
          <span>Flags</span>
          <button
            className="text-ds-blue"
            onClick={() => handleOnDismiss(setIsCardDismissed)}
          >
            Dismiss
          </button>
        </div>
      ),
      value: (
        <div className="flex flex-col">
          <img alt="FlagManagement" src={flagManagement} />
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

function Flags() {
  const { owner, provider, repo, pullId: pullid } = useParams()
  const { data } = useFlagsForComparePage({
    provider,
    owner,
    repo,
    query: { pullid },
  })

  const [isCardDismissed, setIsCardDismissed] = useState(
    localStorage.getItem('dismissFlagsCard') === 'true'
  )
  const tableData = getTableData(data)
  const isDataPopulated = tableData && tableData.length > 0

  if (!isDataPopulated && isCardDismissed) {
    return ''
  }

  const { title, value } = getCardInfo({
    tableData,
    isDataPopulated,
    setIsCardDismissed,
  })

  return <Card title={title}>{value}</Card>
}

export default Flags
