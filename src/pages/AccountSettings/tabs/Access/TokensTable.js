import Button from 'ui/Button'
import Table from 'ui/Table'
import PropTypes from 'prop-types'
import formatDistanceToNow from 'date-fns/formatDistance'

function TokensTable({ tokens, onRevoke }) {
  const dataTable = tokens.map((t) => ({
    col1: t.name,
    col2: (
      <p className="text-center font-mono bg-ds-gray-secondary text-ds-gray-octonary font-bold">{`xxxx ${t.lastFour}`}</p>
    ),
    col3: formatDistanceToNow(new Date(t.lastseen), new Date()),
    col4: (
      <Button onClick={() => onRevoke(t.sessionid)} variant="danger">
        Revoke
      </Button>
    ),
  }))

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

  return <Table data={dataTable} columns={tableColumns} />
}

TokensTable.propTypes = {
  tokens: PropTypes.array,
  onRevoke: PropTypes.func,
}

export default TokensTable
