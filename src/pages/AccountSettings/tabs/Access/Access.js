import Button from 'ui/Button'
import Table from 'ui/Table'
import PropTypes from 'prop-types'
import { useSessions } from 'services/access'
import SessionsTable from './SessionsTable'

function Access({ tokens = [], provider }) {
  const { data } = useSessions({
    provider,
  })

  const renderTokens = () => {
    if (tokens.length <= 0)
      return (
        <span className="text-sm text-gray-octonary">
          No tokens created yet
        </span>
      )
    return <Table />
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
        <SessionsTable sessions={data.sessions} />
      </div>
    </div>
  )
}

Access.propTypes = {
  tokens: PropTypes.array,
  provider: PropTypes.string.isRequired,
}

export default Access
