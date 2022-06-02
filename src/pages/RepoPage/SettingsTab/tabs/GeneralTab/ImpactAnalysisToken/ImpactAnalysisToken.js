import PropTypes from 'prop-types'
import { useState } from 'react'

import A from 'ui/A'
import Button from 'ui/Button'
import TabSection from 'ui/TabSection'
import TokenWrapper from 'ui/TokenWrapper'

import RegenerateProfilingTokenModal from './RegenerateProfilingTokenModal'
import useGenerateProfilingToken from './useGenerateProfilingToken'

function ImpactAnalysisToken({ profilingToken }) {
  const [showModal, setShowModal] = useState(false)
  const { regenerateToken, isLoading, data } = useGenerateProfilingToken()
  const token =
    data?.data?.regenerateProfilingToken?.profilingToken || profilingToken

  return (
    <TabSection
      title={
        <div className="flex gap-2">
          <span>Impact analysis token</span>
          <p className="flex items-center font-semibold rounded px-4 text-white bg-ds-pink-tertiary mt-1 text-sm">
            BETA
          </p>
        </div>
      }
      description={
        <span>
          Token is used for impact analysis feature only{' '}
          <A to={{ pageName: 'runtimeInsights' }} isExternal>
            learn more
          </A>
        </span>
      }
      content={
        <div className="flex">
          <div className="flex-1 flex flex-col gap-4">
            <p>
              If you are not using this feature, you do not need the token. If
              you are uploading coverage reports to Codecov, you should be using
              the repository upload token above.
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
      }
    />
  )
}

ImpactAnalysisToken.propTypes = {
  profilingToken: PropTypes.string.isRequired,
}

export default ImpactAnalysisToken
