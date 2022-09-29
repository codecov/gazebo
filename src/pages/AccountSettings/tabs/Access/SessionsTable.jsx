import PropTypes from 'prop-types'
import { useParams } from 'react-router-dom'

import { useDeleteSession } from 'services/access'
import { formatTimeToNow } from 'shared/utils/dates'
import Button from 'ui/Button'
import Table from 'ui/Table'

const tableColumns = [
  {
    id: 'ip',
    header: 'IP',
    accessorKey: 'ip',
    width: 'w-3/12',
    cell: (info) => info.getValue(),
  },
  {
    id: 'lastSeen',
    header: 'Last Seen',
    accessorKey: 'lastSeen',
    width: 'w-2/12',
    cell: (info) => info.getValue(),
  },
  {
    id: 'userAgent',
    header: 'User Agent',
    accessorKey: 'userAgent',
    width: 'w-6/12',
    cell: (info) => info.getValue(),
  },
  {
    id: 'revokeBtn',
    header: '',
    accessorKey: 'revokeBtn',
    width: 'w-1/6',
    cell: (info) => info.getValue(),
  },
]

function SessionsTable({ sessions }) {
  const { provider } = useParams()
  const { mutate } = useDeleteSession({ provider })

  const handleRevoke = (id) => {
    if (window.confirm('Are you sure you want to revoke this token?')) {
      mutate({ sessionid: id })
    }
  }

  const dataTable = sessions.map((s) => ({
    ip: (
      <p className="text-center font-mono bg-ds-gray-secondary text-ds-gray-octonary font-bold">
        {s.ip}
      </p>
    ),
    lastSeen: s.lastseen ? formatTimeToNow(s.lastseen) : '-',
    userAgent: s.useragent,
    revokeBtn: (
      <Button
        hook="revoke-session"
        onClick={() => handleRevoke(s.sessionid)}
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
