import PropTypes from 'prop-types'

import { commitRequestType } from 'shared/propTypes'
import Table from 'ui/Table'
import TotalsNumber from 'ui/TotalsNumber'

import CIStatus from './CIStatus'
import Coverage from './Coverage'
import Title from './Title'

const headers = [
  {
    id: 'title',
    header: 'Name',
    accessorKey: 'title',
    width: 'w-6/12',
    cell: (info) => info.getValue(),
  },
  {
    id: 'ciStatus',
    header: <span className="w-full text-right">CI status</span>,
    accessorKey: 'ciStatus',
    width: 'w-2/12 lg:w-3/12',
    cell: (info) => info.getValue(),
  },
  {
    id: 'coverage',
    header: (
      <span className="w-full text-right">
        Coverage <span className="hidden lg:inline-block">%</span>
      </span>
    ),
    accessorKey: 'coverage',
    width: 'w-2/12 lg:w-3/12',
    cell: (info) => info.getValue(),
  },
  {
    id: 'patch',
    header: <span className="w-full text-right">Patch %</span>,
    accessorKey: 'patch',
    width: 'w-1/12',
    cell: (info) => info.getValue(),
  },
  {
    id: 'change',
    header: <span className="w-full text-right">Change</span>,
    accessorKey: 'change',
    width: 'w-1/12',
    cell: (info) => info.getValue(),
  },
]

const handleOnNull = () => {
  return {
    title: <span className="text-sm">we can&apos;t find this commit</span>,
    ciStatus: null,
    coverage: null,
    patch: null,
    change: null,
  }
}

function transformPullToTable(commits) {
  // if there are no repos show empty message
  if (commits.length <= 0) {
    return [
      {
        title: <span className="text-sm">no results found</span>,
        ciStatus: null,
        coverage: null,
        patch: null,
        change: null,
      },
    ]
  }

  return commits.map((commit) => {
    if (!commit) return handleOnNull()
    const {
      message,
      author,
      commitid,
      createdAt,
      totals,
      compareWithParent,
      parent,
      ciPassed,
    } = commit
    const change = totals?.coverage - parent?.totals?.coverage
    const patchValue = compareWithParent?.patchTotals?.coverage
      ? compareWithParent?.patchTotals?.coverage * 100
      : Number.NaN

    return {
      title: (
        <Title
          message={message}
          author={author}
          commitid={commitid}
          createdAt={createdAt}
        />
      ),
      ciStatus: (
        <CIStatus
          commitid={commitid}
          coverage={totals?.coverage}
          ciPassed={ciPassed}
        />
      ),
      coverage: <Coverage totals={totals} />,
      /*
          The container div fot TotalsNumber is added due to the current state of table cells styling,
          shouldn't be necessary in the future if fixed/updated
      */
      patch: (
        <div className="w-full flex justify-end">
          <TotalsNumber value={patchValue} data-testid="patch-value" />
        </div>
      ),
      change: (
        <div className="w-full flex justify-end">
          <TotalsNumber value={change} showChange />
        </div>
      ),
    }
  })
}

function CommitsTable({ commits }) {
  const dataTable = transformPullToTable(commits)
  return <Table data={dataTable} columns={headers} />
}

CommitsTable.propTypes = {
  commits: PropTypes.arrayOf(commitRequestType),
}

export default CommitsTable
