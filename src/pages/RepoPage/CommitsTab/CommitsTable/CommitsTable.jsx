import PropTypes from 'prop-types'
import { useParams } from 'react-router-dom'

import Table from 'old_ui/Table'
import { useCommits } from 'services/commits'
import Button from 'ui/Button'
import Spinner from 'ui/Spinner'
import TotalsNumber from 'ui/TotalsNumber'

import Coverage from './Coverage'

import { statusNames } from '../enums'
import CIStatus from '../shared/CIStatus'
import Title from '../shared/Title'

const headers = [
  {
    id: 'title',
    header: 'Name',
    accessorKey: 'title',
    width: 'w-3/12 md:w-5/12 xl:w-7/12',
    cell: (info) => info.getValue(),
    justifyStart: true,
  },
  {
    id: 'ciStatus',
    header: 'CI status',
    accessorKey: 'ciStatus',
    width: 'w-2/12 lg:w-2/12',
    cell: (info) => info.getValue(),
  },
  {
    id: 'coverage',
    header: (
      <>
        Coverage <span className="hidden lg:inline-block">%</span>
      </>
    ),
    accessorKey: 'coverage',
    width: 'w-2/12 lg:w-3/12 justify-end',
    cell: (info) => info.getValue(),
  },
  {
    id: 'patch',
    header: 'Patch %',
    accessorKey: 'patch',
    width: 'w-2/12 xl:w-1/12 justify-end',
    cell: (info) => info.getValue(),
  },
  {
    id: 'change',
    header: 'Change',
    accessorKey: 'change',
    width: 'w-2/12 xl:w-1/12 justify-end',
    cell: (info) => info.getValue(),
  },
]

const handleOnNull = () => {
  return {
    title: <span className="text-sm">We can&apos;t find this commit</span>,
    ciStatus: null,
    coverage: null,
    patch: null,
    change: null,
  }
}

function transformPullToTable(commits) {
  if (commits?.length > 0) {
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
        ? compareWithParent?.patchTotals?.coverage
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
        patch: <TotalsNumber value={patchValue} data-testid="patch-value" />,
        change: <TotalsNumber value={change} showChange />,
      }
    })
  }

  return []
}

const Loader = () => (
  <div className="flex flex-1 justify-center">
    <Spinner size={60} />
  </div>
)

function CommitsTable({ branch, states, search }) {
  const { provider, owner, repo } = useParams()
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useCommits({
      provider,
      owner,
      repo,
      filters: {
        states,
        branchName: branch,
        search,
      },
      opts: { suspense: false },
    })

  const commits = data?.commits

  const dataTable = transformPullToTable(commits)

  return (
    <>
      <Table data={dataTable} columns={headers} />
      {isLoading && <Loader />}
      {hasNextPage && (
        <div className="mt-4 flex flex-1 justify-center">
          <Button
            hook="load-more"
            isLoading={isFetchingNextPage}
            onClick={fetchNextPage}
          >
            Load More
          </Button>
        </div>
      )}
      {dataTable?.length === 0 && !isLoading && (
        <p className="flex flex-1 justify-center">
          No commits detected on branch
        </p>
      )}
    </>
  )
}

CommitsTable.propTypes = {
  branch: PropTypes.string,
  states: PropTypes.arrayOf(PropTypes.oneOf(Object.keys(statusNames))),
  search: PropTypes.string.isRequired,
}

export default CommitsTable
