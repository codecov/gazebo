import Button from 'ui/Button'
import Table from 'ui/Table'
import PropTypes from 'prop-types'
import formatDistanceToNow from 'date-fns/formatDistanceToNow'

const tableColumns = [
  {
    Header: 'Name',
    accessor: 'col1',
    width: 'w-2/12',
  },
  {
    Header: 'Token',
    accessor: 'col2',
    width: 'w-2/12',
  },
  {
    Header: 'Last access',
    accessor: 'col3',
    width: 'w-7/12',
  },
  {
    Header: '',
    accessor: 'col4',
    width: 'w-1/6',
  },
]

function TokensTable({ tokens, onRevoke }) {
  const dataTable = tokens.map((t) => ({
    col1: t.name,
    col2: (
      <p className="text-center font-mono bg-ds-gray-secondary text-ds-gray-octonary font-bold">{`xxxx ${t.lastFour}`}</p>
    ),
    col3: t.lastseen
      ? formatDistanceToNow(new Date(t.lastseen), { addSuffix: true })
      : '-',
    col4: (
      <Button
        hook="revoke-sesson"
        onClick={() => onRevoke(t.sessionid)}
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
