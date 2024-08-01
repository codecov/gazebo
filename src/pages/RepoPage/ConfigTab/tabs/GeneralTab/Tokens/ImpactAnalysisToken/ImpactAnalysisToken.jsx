import PropTypes from 'prop-types'
import { useState } from 'react'

import { useRegenerateRepositoryToken } from 'services/repositoryToken'
import A from 'ui/A'
import Button from 'ui/Button'
import TokenWrapper from 'ui/TokenWrapper'

import RegenerateProfilingTokenModal from './RegenerateProfilingTokenModal'

import { TokenType } from '../enums'

function ImpactAnalysisToken({ profilingToken }) {
  const [showModal, setShowModal] = useState(false)
  const { mutate, isLoading } = useRegenerateRepositoryToken({
    tokenType: TokenType.PROFILING,
  })

  if (!profilingToken) {
    return null
  }

  return (
    <div className="flex flex-col gap-2 border-2 border-ds-gray-primary p-4 sm:flex-row">
      <div className="flex flex-1 flex-col">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold">Impact analysis token</h3>
          <p className="mt-1 flex rounded bg-ds-pink-tertiary px-4 text-sm font-semibold text-white">
            BETA
          </p>
        </div>
        <span>
          Used for impact analysis only{' '}
          <A to={{ pageName: 'runtimeInsights' }} isExternal>
            learn more
          </A>
        </span>
        <div className="mt-4">
          <TokenWrapper token={profilingToken} />
        </div>
      </div>
      <div>
        <Button
          hook="show-modal"
          onClick={() => setShowModal(true)}
          disabled={isLoading}
        >
          Regenerate
        </Button>
        <RegenerateProfilingTokenModal
          showModal={showModal}
          closeModal={() => setShowModal(false)}
          regenerateToken={mutate}
          isLoading={isLoading}
        />
      </div>
    </div>
  )
}

ImpactAnalysisToken.propTypes = {
  profilingToken: PropTypes.string,
}

export default ImpactAnalysisToken
