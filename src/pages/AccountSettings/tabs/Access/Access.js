import Button from 'ui/Button'
import Table from 'ui/Table'
import PropTypes from 'prop-types'

function Access({ tokens = [] }) {
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
      <span className="text-lg font-semibold text-gray-octonary">
        API Tokens
      </span>
      <div className="flex justify-between items-center">
        <span
          data-testid="tokens-summary"
          className="text-sm text-gray-octonary"
        >
          Tokens created to access Codecov{"'"}s API as an authenticated user{' '}
          <a
            data-testid="tokens-docs-link"
            rel="noreferrer"
            target="_blank"
            href="https://docs.codecov.io/reference#authorization"
          >
            learn more
          </a>
        </span>
        <Button>Generate Token</Button>
      </div>
      <hr className="mt-3 mb-3 border-ds-gray-secondary" />
      {renderTokens()}
      <span className="mt-5 text-lg font-semibold text-gray-octonary">
        Login Sessions
      </span>
    </div>
  )
}

Access.propTypes = {
  tokens: PropTypes.array.isRequired,
}

export default Access
