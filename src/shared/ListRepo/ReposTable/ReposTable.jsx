import isEmpty from 'lodash/isEmpty'
import PropTypes from 'prop-types'
import { useContext } from 'react'

import { useRepos } from 'services/repos'
import { useOwner, useUser } from 'services/user'
import { ActiveContext } from 'shared/context'
import { formatTimeToNow } from 'shared/utils/dates'
import Button from 'ui/Button'
import Table from 'ui/Table'
import TotalsNumber from 'ui/TotalsNumber'

import InactiveRepo from './InactiveRepo'
import NoRepoCoverage from './NoRepoCoverage'
import NoReposBlock from './NoReposBlock'
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
    header: 'Last updated',
    accessorKey: 'lastUpdated',
    width: 'w-2/12',
    cell: (info) => info.getValue(),
    justifyStart: true,
  },
  {
    id: 'lines',
    header: 'Tracked lines',
    accessorKey: 'lines',
    width: 'w-2/12',
    cell: (info) => info.getValue(),
  },
  {
    id: 'coverage',
    header: 'Test coverage',
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
function transformRepoToTable({ repos, owner, isCurrentUserPartOfOrg }) {
  // if there are no repos show empty message
  if (!repos?.length || repos?.length <= 0) {
    return [
      {
        title: null,
        lastUpdated: null,
        coverage: null,
        notEnabled: null,
        lines: null,
      },
    ]
  }

  return repos?.map((repo) => {
    return {
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
          <TotalsNumber value={repo.coverage} plain />
        ) : (
          <NoRepoCoverage
            activated={repo.activated}
            active={repo.active}
            isCurrentUserPartOfOrg={isCurrentUserPartOfOrg}
            repoName={repo.name}
            owner={repo?.author.username}
          />
        ),
      notEnabled: (
        <InactiveRepo
          owner={repo?.author.username}
          repoName={repo?.name}
          isCurrentUserPartOfOrg={isCurrentUserPartOfOrg}
          isActive={repo?.active}
        />
      ),
      lines: <div className="w-full text-end">{repo?.lines}</div>,
    }
  })
}

function ReposTable({ searchValue, owner, sortItem, filterValues = [] }) {
  const { data: userData } = useUser()
  const { data: ownerData } = useOwner({
    username: owner || userData?.user?.username,
  })

  const repoDisplay = useContext(ActiveContext)
  const activated = repoDisplayOptions[repoDisplay.toUpperCase()].status

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useRepos({
    activated,
    sortItem,
    term: searchValue,
    repoNames: filterValues,
    owner,
  })

  const dataTable = transformRepoToTable({
    repos: data.repos,
    owner,
    isCurrentUserPartOfOrg: ownerData?.isCurrentUserPartOfOrg,
  })

  if (!isEmpty(data?.repos)) {
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
        {hasNextPage && (
          <div className="mt-4 flex w-full justify-center">
            <Button
              hook="load-more"
              isLoading={isFetchingNextPage}
              onClick={fetchNextPage}
            >
              Load More
            </Button>
          </div>
        )}
      </>
    )
  }

  return (
    <NoReposBlock
      searchValue={searchValue}
      privateAccess={userData?.privateAccess}
    />
  )
}

ReposTable.propTypes = {
  owner: PropTypes.string,
  searchValue: PropTypes.string.isRequired,
  sortItem: PropTypes.object.isRequired,
  filterValues: PropTypes.array,
}

export default ReposTable
