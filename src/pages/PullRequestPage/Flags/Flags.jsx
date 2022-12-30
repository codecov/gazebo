import PropTypes from 'prop-types'
import { useState } from 'react'
import { useParams } from 'react-router-dom'

import flagManagement from 'assets/svg/flagManagement.svg'
import { usePull } from 'services/pull'
import { useFlags } from 'shared/featureFlags'
import A from 'ui/A'
import Table from 'ui/Table'
import TotalsNumber from 'ui/TotalsNumber'

import Card from '../Card'

const NoFlagsBanner = () => {
  return (
    <div className="flex flex-col items-center gap-4">
      <img alt="FlagManagement" src={flagManagement} />
      <h2 className="text-lg">See how flags can help you today!</h2>
      <p className="w-2/4 text-center">
        Codecov Flags allow you to isolate and categorize coverage reports for
        different tests and features in your project Learn how flags can{' '}
        <A hook="flags" to={{ pageName: 'flags' }}>
          help your team today.
        </A>
      </p>
    </div>
  )
}

const tableColumns = [
  {
    id: 'name',
    header: <span>Name</span>,
    accessorKey: 'name',
    width: 'w-7/12 min-w-min',
    cell: (info) => info.getValue(),
    justifyStart: true,
  },
  {
    id: 'headCoverage',
    header: <span className="w-full text-right">HEAD %</span>,
    accessorKey: 'headCoverage',
    width: 'w-3/12 min-w-min',
    cell: (info) => info.getValue(),
  },
  {
    id: 'patchCoverage',
    header: <span className="w-full text-right">Patch %</span>,
    accessorKey: 'patchCoverage',
    width: 'w-28 min-w-min',
    cell: (info) => info.getValue(),
  },
  {
    id: 'changeCoverage',
    header: <span className="w-full text-right">+/-</span>,
    accessorKey: 'changeCoverage',
    width: 'w-28 min-w-min',
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
      value: <NoFlagsBanner />,
    },
  }[cardInfo]
}

function NewFlagsTab({ isTableDataEmpty, tableData }) {
  return isTableDataEmpty ? (
    <NoFlagsBanner />
  ) : (
    <Table data={tableData} columns={tableColumns} />
  )
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

  return pullPageTabs ? (
    <NewFlagsTab isTableDataEmpty={isTableDataEmpty} tableData={tableData} />
  ) : (
    <OldFlagsSection
      tableData={tableData}
      isTableDataEmpty={isTableDataEmpty}
    />
  )
}

export default Flags
