import PropTypes from 'prop-types'
import { useParams } from 'react-router-dom'

import { useRevokeUserToken } from 'services/access'
import { formatTimeToNow } from 'shared/utils/dates'
import Button from 'ui/Button'
import Table from 'ui/Table'

const tableColumns = [
  {
    id: 'name',
    header: 'Name',
    accessorKey: 'name',
    width: 'w-2/12',
    cell: (info) => info.getValue(),
    justifyStart: true,
  },
  {
    id: 'lastFour',
    header: 'Token',
    accessorKey: 'lastFour',
    width: 'w-9/12',
    cell: (info) => info.getValue(),
    justifyStart: true,
  },
  {
    id: 'revokeBtn',
    header: '',
    accessorKey: 'revokeBtn',
    width: 'w-1/6',
    cell: (info) => info.getValue(),
  },
]

function TokensTable({ tokens }) {
  const { provider } = useParams()
  const { mutate } = useRevokeUserToken({ provider })

  const handleRevoke = (id) => {
    if (window.confirm('Are you sure you want to revoke this token?')) {
      mutate({ tokenid: id })
    }
  }

  const dataTable = tokens.map((t) => ({
    name: t?.name,
    lastFour: (
      <p className="text-center font-mono bg-ds-gray-secondary text-ds-gray-octonary font-bold">{`xxxx ${t?.lastFour}`}</p>
    ),
    lastSeen: t?.lastseen ? formatTimeToNow(t?.lastseen) : '-',
    revokeBtn: (
      <Button
        hook="revoke-sesson"
        onClick={() => handleRevoke(t?.id)}
        variant="danger"
      >
        Revoke
      </Button>
    ),
  }))

  return (
    <>
      {tokens.length > 0 && (
        <div className="mt-4 max-w-screen-md">
          <Table data={dataTable} columns={tableColumns} />
        </div>
      )}
      {tokens <= 0 && (
        <>
          <hr className="mt-4 mb-4 border-ds-gray-secondary" />
          <span className="text-sm text-gray-octonary">
            No tokens created yet
          </span>
        </>
      )}
    </>
  )
}

TokensTable.propTypes = {
  tokens: PropTypes.array,
  onRevoke: PropTypes.func,
}

export default TokensTable
