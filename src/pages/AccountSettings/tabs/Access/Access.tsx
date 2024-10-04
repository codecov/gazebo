import { useState } from 'react'
import { Redirect, useParams } from 'react-router-dom'

import { useSessions } from 'services/access'
import { useUser } from 'services/user'
import Button from 'ui/Button'

import CreateTokenModal from './CreateTokenModal'
import SessionsTable from './SessionsTable'
import TokensTable from './TokensTable'

interface URLParams {
  provider: string
  owner: string
}

function Access() {
  const { provider, owner } = useParams<URLParams>()
  const [showModal, setShowModal] = useState(false)

  const { data: sessionData } = useSessions({
    provider,
  })

  const { data: currentUser } = useUser()

  const isViewingPersonalSettings =
    currentUser?.user?.username?.toLowerCase() === owner?.toLowerCase()

  if (!isViewingPersonalSettings) {
    return <Redirect to={`/account/${provider}/${owner}`} />
  }

  return (
    <div className="flex flex-col lg:w-3/4">
      <h2 className="text-lg font-semibold">API Tokens</h2>
      <div className="flex items-center justify-between">
        <p>
          Tokens created to access Codecov&apos;s API as an authenticated user{' '}
          <a
            rel="noreferrer"
            target="_blank"
            href="https://docs.codecov.com/reference/overview"
            className="text-ds-blue-default"
          >
            learn more
          </a>
          .
        </p>
        <Button
          hook="generate-token"
          onClick={() => setShowModal(true)}
          to={undefined}
          disabled={false}
        >
          Generate Token
        </Button>
        {showModal && (
          <CreateTokenModal
            provider={provider}
            closeModal={() => setShowModal(false)}
          />
        )}
      </div>
      <TokensTable tokens={sessionData?.tokens} />
      <h2 className="mb-4 mt-8 text-lg font-semibold">Login Sessions</h2>
      <SessionsTable sessions={sessionData?.sessions} />
    </div>
  )
}

export default Access
