import PropTypes from 'prop-types'
import { useState } from 'react'
import { useParams } from 'react-router-dom'

import FlagsNotConfigured from 'pages/RepoPage/FlagsTab/FlagsNotConfigured'
import { usePull } from 'services/pull'
import { useFlags } from 'shared/featureFlags'
import Table from 'ui/Table'
import TotalsNumber from 'ui/TotalsNumber'

import Card from '../../Card'

const tableColumns = [
  {
    id: 'name',
    header: <span>Name</span>,
    accessorKey: 'name',
    width: 'w-7/12',
    cell: (info) => info.getValue(),
    justifyStart: true,
  },
  {
    id: 'headCoverage',
    header: <span className="w-full text-right">HEAD %</span>,
    accessorKey: 'headCoverage',
    width: 'w-3/12 justify-end',
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
    header: <span className="w-full text-right">+/-</span>,
    accessorKey: 'changeCoverage',
    width: 'w-28 justify-end',
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
      value: <FlagsNotConfigured />,
    },
  }[cardInfo]
}

function NewFlagsTab({ isTableDataEmpty, tableData }) {
  if (isTableDataEmpty) {
    return <FlagsNotConfigured />
  }
  return <Table data={tableData} columns={tableColumns} />
}

NewFlagsTab.propTypes = {
  isTableDataEmpty: PropTypes.bool.isRequired,
  tableData: PropTypes.arrayOf(
    PropTypes.shape({
      changeCoverage: PropTypes.object,
      headCoverage: PropTypes.object,
      name: PropTypes.object,
      patchCoverage: PropTypes.object,
    })
  ),
}

function OldFlagsSection({ isTableDataEmpty, tableData }) {
  const [isCardDismissed, setIsCardDismissed] = useState(
    !!JSON.parse(localStorage.getItem(localStorageKey))
  )
  const { title, value } = getTableInfo({
    tableData,
    isTableDataEmpty,
    setIsCardDismissed,
  })

  return (
    !(isTableDataEmpty && isCardDismissed) && <Card title={title}>{value}</Card>
  )
}
OldFlagsSection.propTypes = {
  isTableDataEmpty: PropTypes.bool.isRequired,
  tableData: PropTypes.arrayOf(
    PropTypes.shape({
      changeCoverage: PropTypes.object,
      headCoverage: PropTypes.object,
      name: PropTypes.object,
      patchCoverage: PropTypes.object,
    })
  ),
}

function Flags() {
  const { owner, repo, pullId, provider } = useParams()
  const { data } = usePull({ provider, owner, repo, pullId })
  const flagComparison = data?.pull?.compareWithBase?.flagComparisons || []
  const { pullPageTabs } = useFlags({ pullPageTabs: true })

  const tableData = getTableData(flagComparison)
  const isTableDataEmpty = tableData && tableData?.length <= 0

  if (pullPageTabs) {
    return (
      <NewFlagsTab isTableDataEmpty={isTableDataEmpty} tableData={tableData} />
    )
  }

  return (
    <OldFlagsSection
      tableData={tableData}
      isTableDataEmpty={isTableDataEmpty}
    />
  )
}

export default Flags
