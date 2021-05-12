import Table from 'ui/Table'
import OrgBreadcrumb from './OrgBreadcrumb'
import formatDistanceToNow from 'date-fns/formatDistanceToNow'
import Progress from 'ui/Progress'
import PropTypes from 'prop-types'

const tableColumns = [
  {
    Header: 'Name',
    accessor: 'col1',
    width: 'w-7/12',
  },
  {
    Header: 'Last Updated',
    accessor: 'col2',
    width: 'w-2/12',
  },
  {
    Header: 'Test Coverage',
    accessor: 'col3',
    width: 'w-3/12',
  },
]

function ActiveReposTable({ repos }) {
  const dataTable = repos.map((repo) => ({
    col1: <OrgBreadcrumb repo={repo} />,
    col2: formatDistanceToNow(new Date(repo.updatedAt)),
    col3: <Progress amount={repo.coverage} label={true} />,
  }))

  return <Table data={dataTable} columns={tableColumns} />
}

ActiveReposTable.propTypes = {
  repos: PropTypes.array,
}

export default ActiveReposTable
