import PropTypes from 'prop-types'
import formatDistanceToNow from 'date-fns/formatDistanceToNow'

import Progress from 'ui/Progress'
import Table from 'ui/Table'
import { useRepos } from 'services/repos/hooks'
import AppLink from 'shared/AppLink'

import RepoTitleLink from './RepoTitleLink'

const tableActive = [
  {
    Header: 'Name',
    accessor: 'title',
    width: 'w-7/12',
  },
  {
    Header: 'Last Updated',
    accessor: 'lastUpdated',
    width: 'w-2/12',
  },
  {
    Header: 'Test Coverage',
    accessor: 'coverage',
    width: 'w-3/12',
  },
]

const tableInactive = [
  {
    Header: 'Name',
    accessor: 'title',
    width: 'w-9/12',
  },
  {
    Header: '',
    accessor: 'notEnabled',
    width: 'w-3/12',
  },
]

function transformRepoToTable(repos, owner) {
  // if we have an owner, then we don't need to show it on the repo title
  const showRepoOwner = !owner

  return repos.map((repo) => ({
    title: <RepoTitleLink repo={repo} showRepoOwner={showRepoOwner} />,
    lastUpdated: formatDistanceToNow(new Date(repo.updatedAt)),
    coverage:
      typeof repo.coverage === 'number' ? (
        <Progress amount={repo.coverage} label={true} />
      ) : (
        <span className="text-gray-quinary text-sm">No data available</span>
      ),
    notEnabled: (
      <span>
        Not yet enabled{' '}
        <AppLink
          className="text-ds-blue font-semibold"
          pageName="repo"
          options={{
            owner: repo.author.username,
            repo: repo.name,
          }}
        >
          setup repo
        </AppLink>
      </span>
    ),
  }))
}

function ReposTable({ active, searchValue, owner, sortItem }) {
  const { data } = useRepos({
    active,
    sortItem,
    term: searchValue,
    owner,
  })

  const dataTable = transformRepoToTable(data.repos, owner)

  return (
    <Table data={dataTable} columns={active ? tableActive : tableInactive} />
  )
}

ReposTable.propTypes = {
  owner: PropTypes.string,
  active: PropTypes.bool.isRequired,
  searchValue: PropTypes.string.isRequired,
  sortItem: PropTypes.object.isRequired,
}

export default ReposTable
