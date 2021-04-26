import Button from 'ui/Button'
import PropTypes from 'prop-types'
import { useSessions, useDeleteSession } from 'services/access'
import SessionsTable from './SessionsTable'
import TokensTable from './TokensTable'

function Access({ provider }) {
  const { data } = useSessions({
    provider,
  })

  const { mutate } = useDeleteSession({ provider })

  const handleRevoke = (id) => {
    if (window.confirm('Are you sure you want to revoke this token?')) {
      mutate({ sessionid: id })
    }
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
      <TokensTable onRevoke={handleRevoke} tokens={data.tokens} />
      <h2 className="mt-8 mb-4 text-lg font-semibold text-gray-octonary">
        Login Sessions
      </h2>
      <div className="max-w-screen-md">
        <SessionsTable onRevoke={handleRevoke} sessions={data.sessions} />
      </div>
    </div>
  )
}

Access.propTypes = {
  provider: PropTypes.string.isRequired,
}

export default Access
