import PropTypes from 'prop-types'
import { useContext } from 'react'

import { useRepos } from 'services/repos'
import { useOwner, useUser } from 'services/user'
import AppLink from 'shared/AppLink'
import { ActiveContext } from 'shared/context'
import { formatTimeToNow } from 'shared/utils/dates'
import Button from 'ui/Button'
import Progress from 'ui/Progress'
import Table from 'ui/Table'

import NoReposBlock from './NoReposBlock'
import RepoTitleLink from './RepoTitleLink'

const tableActive = [
  {
    id: 'title',
    header: 'Name',
    accessorKey: 'title',
    width: 'w-7/12',
    cell: (info) => info.getValue(),
  },
  {
    id: 'lastUpdated',
    header: <span className="w-full text-right">Last Updated</span>,
    accessorKey: 'lastUpdated',
    width: 'w-2/12',
    cell: (info) => info.getValue(),
  },
  {
    id: 'coverage',
    header: <span className="w-full text-sm text-right">Test Coverage</span>,
    accessorKey: 'coverage',
    width: 'w-3/12',
    cell: (info) => info.getValue(),
  },
]

const tableInactive = [
  {
    id: 'title',
    header: 'Name',
    accessorKey: 'title',
    width: 'w-9/12',
    cell: (info) => info.getValue(),
  },
  {
    id: 'notEnabled',
    header: '',
    accessorKey: 'notEnabled',
    width: 'w-3/12',
    cell: (info) => info.getValue(),
  },
]

function transformRepoToTable({
  repos,
  owner,
  searchValue,
  isSetup,
  isCurrentUserPartOfOrg,
}) {
  // if there are no repos show empty message
  if (!repos?.length || repos?.length <= 0) {
    return [
      {
        title: (
          <span className="text-sm">{searchValue && 'no results found'}</span>
        ),
        lastUpdated: null,
        coverage: null,
        notEnabled: null,
      },
    ]
  }

  const repoPageName = !isSetup ? 'new' : 'repo'
  return repos?.map((repo) => ({
    title: (
      <RepoTitleLink
        repo={repo}
        showRepoOwner={!owner}
        pageName={repoPageName}
      />
    ),
    lastUpdated: (
      <span className="w-full text-right text-ds-gray-quinary">
        {repo?.latestCommitAt ? formatTimeToNow(repo?.latestCommitAt) : ''}
      </span>
    ),
    coverage:
      typeof repo?.coverage === 'number' ? (
        <div className="w-full flex gap-2 justify-end items-center">
          <Progress amount={repo?.coverage} label={true} />
        </div>
      ) : (
        <span className="text-ds-gray-quinary text-sm">No data available</span>
      ),
    notEnabled: (
      <span className="flex w-full justify-end gap-1">
        Not yet enabled{' '}
        {isCurrentUserPartOfOrg && (
          <AppLink
            className="text-ds-blue font-semibold"
            pageName="new"
            options={{
              owner: repo?.author.username,
              repo: repo?.name,
            }}
          >
            setup repo
          </AppLink>
        )}
      </span>
    ),
  }))
}

// eslint-disable-next-line complexity
function ReposTable({ searchValue, owner, sortItem, filterValues = [] }) {
  const active = useContext(ActiveContext)
  const { data: userData } = useUser()
  const { data: ownerData } = useOwner({
    username: owner || userData?.user?.username,
  })

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useRepos({
    active,
    sortItem,
    term: searchValue,
    repoNames: filterValues,
    owner,
  })

  const dataTable = transformRepoToTable({
    repos: data.repos,
    owner,
    searchValue,
    isSetup: active,
    isCurrentUserPartOfOrg: ownerData?.isCurrentUserPartOfOrg,
  })

  return (
    <>
      <Table data={dataTable} columns={active ? tableActive : tableInactive} />
      {data?.repos?.length
        ? hasNextPage && (
            <div className="w-full mt-4 flex justify-center">
              <Button
                hook="load-more"
                isLoading={isFetchingNextPage}
                onClick={fetchNextPage}
              >
                Load More
              </Button>
            </div>
          )
        : !searchValue && <NoReposBlock owner={owner} />}
    </>
  )
}

ReposTable.propTypes = {
  owner: PropTypes.string,
  searchValue: PropTypes.string.isRequired,
  sortItem: PropTypes.object.isRequired,
  filterValues: PropTypes.array,
}

export default ReposTable
