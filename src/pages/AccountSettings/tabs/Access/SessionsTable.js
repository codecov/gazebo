import { formatLastSeen } from 'shared/utils/dates'
import Button from 'ui/Button'
import Table from 'ui/Table'
import PropTypes from 'prop-types'

function SessionsTable({ sessions }) {
  const getSessionsTableData = () => {
    return sessions.map((s) => ({
      col1: (
        <p className="text-center font-mono bg-ds-gray-secondary text-ds-gray-octonary font-bold">
          {s.ip}
        </p>
      ),
      col2: formatLastSeen(s.lastseen),
      col3: s.useragent,
      col4: <Button variant="danger">Revoke</Button>,
    }))
  }

  const getSessionsTableColumns = () => {
    return [
      {
        Header: 'IP',
        accessor: 'col1',
        width: 'w-3/12',
      },
      {
        Header: 'Last Seen',
        accessor: 'col2',
        width: 'w-2/12',
      },
      {
        Header: 'User Agent',
        accessor: 'col3',
        width: 'w-6/12',
      },
      {
        Header: '',
        accessor: 'col4',
        width: 'w-1/6',
      },
    ]
  }

  return (
    <Table data={getSessionsTableData()} columns={getSessionsTableColumns()} />
  )
}

SessionsTable.propTypes = {
  sessions: PropTypes.array,
}

export default SessionsTable
