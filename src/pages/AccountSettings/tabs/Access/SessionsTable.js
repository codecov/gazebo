import formatDistanceToNow from 'date-fns/formatDistanceToNow'
import PropTypes from 'prop-types'

import Button from 'ui/Button'
import Table from 'ui/Table'

const tableColumns = [
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

function SessionsTable({ sessions, onRevoke }) {
  const dataTable = sessions.map((s) => ({
    col1: (
      <p className="text-center font-mono bg-ds-gray-secondary text-ds-gray-octonary font-bold">
        {s.ip}
      </p>
    ),
    col2: s.lastseen
      ? formatDistanceToNow(new Date(s.lastseen), { addSuffix: true })
      : '-',
    col3: s.useragent,
    col4: (
      <Button
        hook="revoke-session"
        onClick={() => onRevoke(s.sessionid)}
        variant="danger"
      >
        Revoke
      </Button>
    ),
  }))

  return <Table data={dataTable} columns={tableColumns} />
}

SessionsTable.propTypes = {
  sessions: PropTypes.array,
  onRevoke: PropTypes.func,
}

export default SessionsTable
