import Button from 'ui/Button'
import Table from 'ui/Table'
import PropTypes from 'prop-types'
import { useSessions } from 'services/access'
import formatDistance from 'date-fns/formatDistance'

function Access({ tokens = [], provider }) {
  const { data } = useSessions({
    provider,
  })

  const formatLastSeen = (lastseen) => {
    const date = new Date(lastseen)
    const today = new Date()
    return formatDistance(date, today, 'MM/dd/yyyy')
  }

  const renderTokens = () => {
    if (tokens.length <= 0)
      return (
        <span className="text-sm text-gray-octonary">
          No tokens created yet
        </span>
      )
    return <Table />
  }

  const getSessionsTableData = () => {
    return data.sessions.map((s) => ({
      col1: (
        <p className="text-center font-mono bg-ds-gray-secondary text-ds-gray-octonary font-bold">
          {s.ip}
        </p>
      ),
      col2: (
        <span data-testid="sessions-lastseen">
          {formatLastSeen(s.lastseen)}
        </span>
      ),
      col3: <span data-testid="sessions-useragent">{s.useragent}</span>,
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
    <div className="flex flex-col">
      <h2 className="text-lg font-semibold text-gray-octonary">API Tokens</h2>
      <div className="flex justify-between items-center">
        <p data-testid="tokens-summary" className="text-sm text-gray-octonary">
          Tokens created to access Codecov`s API as an authenticated user{' '}
          <a
            data-testid="tokens-docs-link"
            rel="noreferrer"
            target="_blank"
            href="https://docs.codecov.io/reference#authorization"
          >
            learn more
          </a>
        </p>
        <Button>Generate Token</Button>
      </div>
      <hr className="mt-4 mb-4 border-ds-gray-secondary" />
      {renderTokens()}
      <h2 className="mt-8 mb-4 text-lg font-semibold text-gray-octonary">
        Login Sessions
      </h2>
      <div className="max-w-screen-md">
        <Table
          data={getSessionsTableData()}
          columns={getSessionsTableColumns()}
        />
      </div>
    </div>
  )
}

Access.propTypes = {
  tokens: PropTypes.array,
  provider: PropTypes.string.isRequired,
}

export default Access
