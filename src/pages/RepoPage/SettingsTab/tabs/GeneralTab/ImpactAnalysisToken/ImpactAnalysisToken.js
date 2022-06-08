import PropTypes from 'prop-types'
import { useState } from 'react'
// import { useParams } from 'react-router-dom'

// import {
//   identifySegmentEvent,
//   identifySegmentUser,
//   trackSegmentEvent,
// } from 'services/tracking/segment'
import { useUser } from 'services/user'
import A from 'ui/A'
import Button from 'ui/Button'
import SettingsDescriptor from 'ui/SettingsDescriptor'
import TokenWrapper from 'ui/TokenWrapper'

import RegenerateProfilingTokenModal from './RegenerateProfilingTokenModal'
import useGenerateProfilingToken from './useGenerateProfilingToken'

function ImpactAnalysisToken({ profilingToken }) {
  const [showModal, setShowModal] = useState(false)
  const { regenerateToken, data, isLoading } = useGenerateProfilingToken()
  const token = data?.regenerateProfilingToken?.profilingToken || profilingToken
  const { data: user } = useUser()
  // const { repo } = useParams()

  return (
    <SettingsDescriptor
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
            <TokenWrapper
              token={token}
              onClick={() => {
                const data = {
                  id: user?.trackingMetadata?.ownerid,
                  data: {
                    event: 'Impact Analysis Profiling Token Copied',
                    // eslint-disable-next-line camelcase
                    user_ownerid: user?.trackingMetadata?.ownerid,
                    // eslint-disable-next-line camelcase
                    repo_ownerid: '',
                  },
                }
                console.debug(data)
                // identifySegmentEvent({
                //   id: user?.trackingMetadata?.ownerid,
                //   data: {
                //     event: 'Impact Analysis Profiling Token Copied',
                //     // eslint-disable-next-line camelcase
                //     user_ownerid: user?.trackingMetadata?.ownerid,
                //     // eslint-disable-next-line camelcase
                //     repo_ownerid: '',
                //   },
                // })
              }}
            />
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
