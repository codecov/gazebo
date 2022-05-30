import PropTypes from 'prop-types'
import { useState } from 'react'

import { useRegenerateProfilingToken } from 'services/profilingToken'
import { useAddNotification } from 'services/toastNotification'
import A from 'ui/A'
import Button from 'ui/Button'
import TokenWrapper from 'ui/TokenWrapper'

import RegenerateProfilingTokenModal from './RegenerateProfilingTokenModal'

function useGenerateProfilingToken() {
  const addToast = useAddNotification()
  const { mutate, data, ...rest } = useRegenerateProfilingToken()

  async function regenerateToken() {
    mutate()
    if (data?.data?.regenerateProfilingToken?.error) {
      addToast({
        type: 'error',
        text: 'Something went wrong',
      })
    }
  }
  return { regenerateToken, data, ...rest }
}

function ImpactAnalysisToken({ profilingToken }) {
  const [showModal, setShowModal] = useState(false)
  const { regenerateToken, isLoading, data } = useGenerateProfilingToken()
  const token =
    data?.data?.regenerateProfilingToken?.profilingToken || profilingToken

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <h1 className="font-semibold text-lg">Impact analysis token</h1>
          <div className="mt-1">
            <p className="flex items-center font-semibold rounded px-4 text-white bg-ds-pink-tertiary">
              BETA
            </p>
          </div>
        </div>
        <p>
          Token is used for impact analysis feature only{' '}
          <A to={{ pageName: 'runtimeInsights' }} isExternal>
            learn more
          </A>
        </p>
        <hr />
      </div>
      <div className="border-2 border-gray-100 p-4 flex xl:w-4/5 2xl:w-3/5">
        <div className="flex-1 flex flex-col gap-4">
          <p>
            If you are not using this feature, you do not need the token. If you
            are uploading coverage reports to Codecov, you should be using the
            repository upload token above.
          </p>
          <TokenWrapper token={token} />
        </div>
        <div>
          <Button
            hook="show-modal"
            onClick={() => setShowModal(true)}
            disabled={isLoading}
          >
            Regenerate
          </Button>
          {showModal && (
            <RegenerateProfilingTokenModal
              closeModal={() => setShowModal(false)}
              regenerateToken={regenerateToken}
              isLoading={isLoading}
            />
          )}
        </div>
      </div>
    </div>
  )
}

ImpactAnalysisToken.propTypes = {
  profilingToken: PropTypes.string.isRequired,
}

export default ImpactAnalysisToken
