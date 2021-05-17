import Table from 'ui/Table'
import OrgBreadcrumb from './OrgBreadcrumb'
import PropTypes from 'prop-types'

const tableColumns = [
  {
    Header: 'Name',
    accessor: 'col1',
    width: 'w-9/12',
  },
  {
    Header: '',
    accessor: 'col2',
    width: 'w-3/12',
  },
]

function InactiveReposTable({ repos }) {
  const dataTable = repos.map((repo) => ({
    col1: <OrgBreadcrumb repo={repo} />,
    col2: <span>Not yet enabled setup repo</span>,
  }))

  return <Table data={dataTable} columns={tableColumns} />
}

InactiveReposTable.propTypes = {
  repos: PropTypes.array,
}

export default InactiveReposTable
