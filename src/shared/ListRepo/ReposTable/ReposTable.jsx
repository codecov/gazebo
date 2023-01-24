import PropTypes from 'prop-types'
import { useContext } from 'react'

import { useRepos } from 'services/repos'
import { useOwner, useUser } from 'services/user'
import { ActiveContext } from 'shared/context'
import { formatTimeToNow } from 'shared/utils/dates'
import Button from 'ui/Button'
import Progress from 'ui/Progress'
import Table from 'ui/Table'

import NoRepoCoverage from './NoRepoCoverage'
import NoReposBlock from './NoReposBlock'
import RepoNotSetup from './RepoNotSetup'
import RepoTitleLink from './RepoTitleLink'

import { repoDisplayOptions } from '../ListRepo'

const tableActive = [
  {
    id: 'title',
    header: 'Name',
    accessorKey: 'title',
    width: 'w-7/12',
    cell: (info) => info.getValue(),
    justifyStart: true,
  },
  {
    id: 'lastUpdated',
    header: 'Last Updated',
    accessorKey: 'lastUpdated',
    width: 'w-2/12',
    cell: (info) => info.getValue(),
    justifyStart: true,
  },
  {
    id: 'coverage',
    header: 'Test Coverage',
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
    justifyStart: true,
  },
  {
    id: 'notEnabled',
    header: '',
    accessorKey: 'notEnabled',
    width: 'w-3/12',
    cell: (info) => info.getValue(),
  },
]

// eslint-disable-next-line complexity
function transformRepoToTable({
  repos,
  owner,
  searchValue,
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

  return repos?.map((repo) => ({
    title: (
      <RepoTitleLink
        repo={repo}
        showRepoOwner={!owner}
        pageName={repo.active ? 'repo' : 'new'}
        disabledLink={!isCurrentUserPartOfOrg && !repo.active}
      />
    ),
    lastUpdated: (
      <span className="flex-1 text-ds-gray-quinary">
        {repo?.latestCommitAt ? formatTimeToNow(repo?.latestCommitAt) : ''}
      </span>
    ),
    coverage:
      typeof repo?.coverage === 'number' ? (
        <Progress amount={repo?.coverage} label={true} />
      ) : (
        <NoRepoCoverage
          active={repo.active}
          isCurrentUserPartOfOrg={isCurrentUserPartOfOrg}
          repoName={repo.name}
          owner={repo?.author.username}
        />
      ),
    notEnabled: (
      <RepoNotSetup
        owner={repo?.author.username}
        repoName={repo?.name}
        isCurrentUserPartOfOrg={isCurrentUserPartOfOrg}
      />
    ),
  }))
}

// eslint-disable-next-line complexity
function ReposTable({ searchValue, owner, sortItem, filterValues = [] }) {
  const repoDisplay = useContext(ActiveContext)
  const option = Object.keys(repoDisplayOptions).find((key) => {
    return repoDisplayOptions[key].text === repoDisplay
  })
  const active = repoDisplayOptions[option].status
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
    isCurrentUserPartOfOrg: ownerData?.isCurrentUserPartOfOrg,
  })

  return (
    <>
      <Table
        data={dataTable}
        columns={
          repoDisplay === repoDisplayOptions.INACTIVE.text
            ? tableInactive
            : tableActive
        }
      />
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
