import PropTypes from 'prop-types'
import { useContext, useState } from 'react'

import { useDeleteSession, useSessions } from 'services/access'
import { useFlags } from 'shared/featureFlags'
import { ThemeContext } from 'shared/ThemeContext'
import Button from 'ui/Button'
import Toggle from 'ui/Toggle'

import CreateTokenModal from './CreateTokenModal'
import SessionsTable from './SessionsTable'
import TokensTable from './TokensTable'

const colorblindTheme = 'color-blind'

function Access({ provider }) {
  const { data } = useSessions({
    provider,
  })

  const [showModal, setShowModal] = useState(false)
  const { mutate } = useDeleteSession({ provider })

  const { showThemeToggle } = useFlags({ showThemeToggle: false })
  const { theme, setTheme } = useContext(ThemeContext)

  const handleRevoke = (id) => {
    if (window.confirm('Are you sure you want to revoke this token?')) {
      mutate({ sessionid: id })
    }
  }

  return (
    <div className="flex flex-col">
      {showThemeToggle && (
        <div className="flex justify-end mb-6">
          <Toggle
            label="Colorblind Friendly"
            value={theme === colorblindTheme}
            onClick={() => {
              if (theme !== colorblindTheme) {
                setTheme(colorblindTheme)
              } else {
                setTheme('')
              }
            }}
          />
        </div>
      )}
      <h2 className="text-lg font-semibold">API Tokens</h2>
      <div className="flex justify-between items-center">
        <p data-testid="tokens-summary">
          Tokens created to access Codecov’s API as an authenticated user{' '}
          <a
            data-testid="tokens-docs-link"
            rel="noreferrer"
            target="_blank"
            href="https://docs.codecov.io/reference/authorization"
            className="text-ds-blue"
          >
            learn more
          </a>
          .
        </p>
        <Button hook="generate-token" onClick={() => setShowModal(true)}>
          Generate Token
        </Button>
        {showModal && (
          <CreateTokenModal
            provider={provider}
            closeModal={() => setShowModal(false)}
          />
        )}
      </div>
      <TokensTable onRevoke={handleRevoke} tokens={data.tokens} />
      <h2 className="mt-8 mb-4 text-lg font-semibold">Login Sessions</h2>
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
