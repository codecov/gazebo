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
    id: 'name',
    header: <span>Name</span>,
    accessorKey: 'name',
    width: 'w-4/12',
    cell: (info) => info.getValue(),
  },
  {
    id: 'headCoverage',
    header: <span className="w-full text-right">HEAD %</span>,
    accessorKey: 'headCoverage',
    width: 'w-3/12',
    cell: (info) => info.getValue(),
  },
  {
    id: 'patchCoverage',
    header: <span className="w-full text-right">Patch %</span>,
    accessorKey: 'patchCoverage',
    width: 'w-3/12',
    cell: (info) => info.getValue(),
  },
  {
    id: 'changeCoverage',
    header: <span className="w-full text-right">+/-</span>,
    accessorKey: 'changeCoverage',
    width: 'w-3/12',
    cell: (info) => info.getValue(),
  },
]

const localStorageKey = 'gz-dismissFlagsCard'

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
          <h2 key={name} className="break-words w-24">
            {name}
          </h2>
        ),
        headCoverage: (
          <div className="w-full flex justify-end">
            <TotalsNumber value={headCoverage} plain light />
          </div>
        ),
        patchCoverage: (
          <div className="w-full flex justify-end">
            <TotalsNumber value={patchCoverage} plain light />
          </div>
        ),
        changeCoverage: (
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
  localStorage.setItem(localStorageKey, 'true')
}

function getTableInfo({ tableData, isTableDataEmpty, setIsCardDismissed }) {
  const cardInfo = isTableDataEmpty ? 'showMarketingInfo' : 'showFlagsData'
  return {
    showFlagsData: {
      // TODO: Add carryforward flag title here. This endpoint doesn't surface if a flag is CFF or not, so this would be a feature for the GQL implementation here
      title: 'Flags',
      value: <Table data={tableData} columns={tableColumns} />,
    },
    showMarketingInfo: {
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
            Flags feature is not yet configured. Learn how flags can{' '}
            <A hook="flags" to={{ pageName: 'flags' }}>
              help your team today
            </A>
            .
          </p>
        </div>
      ),
    },
  }[cardInfo]
}

function Flags() {
  const { owner, provider, repo, pullId: pullid } = useParams()
  const { data } = useFlagsForComparePage({
    provider,
    owner,
    repo,
    pullId: pullid,
  })

  const [isCardDismissed, setIsCardDismissed] = useState(
    !!JSON.parse(localStorage.getItem(localStorageKey))
  )
  const tableData = getTableData(data)
  const isTableDataEmpty = tableData && tableData.length <= 0
  const { title, value } = getTableInfo({
    tableData,
    isTableDataEmpty,
    setIsCardDismissed,
  })

  return (
    !(isTableDataEmpty && isCardDismissed) && <Card title={title}>{value}</Card>
  )
}

export default Flags
