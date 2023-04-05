import PropTypes from 'prop-types'
import { useState } from 'react'
import { useParams } from 'react-router-dom'

import { useRegenerateRepositoryToken } from 'services/repositoryToken'
import { trackSegmentEvent } from 'services/tracking/segment'
import { useUser } from 'services/user'
import { snakeifyKeys } from 'shared/utils/snakeifyKeys'
import A from 'ui/A'
import Button from 'ui/Button'
import SettingsDescriptor from 'ui/SettingsDescriptor'
import TokenWrapper from 'ui/TokenWrapper'

import { TokenType } from './enums'
import RegenerateProfilingTokenModal from './RegenerateProfilingTokenModal'

function ImpactAnalysisToken({ profilingToken }) {
  const [showModal, setShowModal] = useState(false)
  const { mutate, isLoading } = useRegenerateRepositoryToken({
    tokenType: TokenType.PROFILING,
  })
  const { data: user } = useUser()
  const { owner, repo } = useParams()

  if (!profilingToken) {
    return null
  }

  return (
    <SettingsDescriptor
      title={
        <div className="flex gap-2">
          <span>Impact analysis token</span>
          <p className="mt-1 flex items-center rounded bg-ds-pink-tertiary px-4 text-sm font-semibold text-white">
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
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="flex flex-1 flex-col gap-4">
            <p>
              If you are not using this feature, you do not need the token. If
              you are uploading coverage reports to Codecov, you should be using
              the repository upload token above.
            </p>
            <TokenWrapper
              token={profilingToken}
              onClick={() => {
                trackSegmentEvent(
                  snakeifyKeys({
                    event: 'Impact Analysis Profiling Token Copied',
                    data: {
                      id: user?.trackingMetadata?.ownerid,
                      userOwnerid: user?.trackingMetadata?.ownerid,
                      ownerSlug: owner,
                      repoSlug: repo,
                    },
                  })
                )
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
            <RegenerateProfilingTokenModal
              showModal={showModal}
              closeModal={() => setShowModal(false)}
              regenerateToken={mutate}
              isLoading={isLoading}
            />
          </div>
        </div>
      }
    />
  )
}

ImpactAnalysisToken.propTypes = {
  profilingToken: PropTypes.string,
}

export default ImpactAnalysisToken
