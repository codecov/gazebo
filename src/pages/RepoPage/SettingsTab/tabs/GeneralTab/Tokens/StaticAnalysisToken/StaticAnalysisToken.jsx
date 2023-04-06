import PropTypes from 'prop-types'
import { useState } from 'react'
import { useParams } from 'react-router-dom'

import { useRegenerateRepositoryToken } from 'services/repositoryToken'
import { trackSegmentEvent } from 'services/tracking/segment'
import { useUser } from 'services/user'
import { snakeifyKeys } from 'shared/utils/snakeifyKeys'
import A from 'ui/A'
import Button from 'ui/Button'
import TokenWrapper from 'ui/TokenWrapper'

import RegenerateStaticTokenModal from './RegenerateStaticTokenModal'

import { TokenType } from '../enums'

function StaticAnalysisToken({ staticAnalysisToken }) {
  const [showModal, setShowModal] = useState(false)
  const { mutate, isLoading } = useRegenerateRepositoryToken({
    tokenType: TokenType.STATIC_ANALYSIS,
  })
  const { data: user } = useUser()
  const { owner, repo } = useParams()

  if (!staticAnalysisToken) {
    return null
  }

  return (
    <div className="flex flex-col gap-2 border-2 border-ds-gray-primary p-4 sm:flex-row xl:w-4/5 2xl:w-3/5">
      <div className="flex flex-1 flex-col">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold">Static analysis token</h3>
          <p className="mt-1 flex rounded bg-ds-pink-tertiary px-4 text-sm font-semibold text-white">
            BETA
          </p>
        </div>
        <span>
          Required for static analysis only{' '}
          <A to={{ pageName: 'runtimeInsights' }} isExternal>
            learn more
          </A>
        </span>
        <div className="mt-4">
          <TokenWrapper
            token={staticAnalysisToken}
            onClick={() => {
              trackSegmentEvent(
                snakeifyKeys({
                  event: 'Static Analysis Token Copied',
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
      </div>
      <div>
        <Button
          hook="show-modal"
          onClick={() => setShowModal(true)}
          disabled={isLoading}
        >
          Regenerate
        </Button>
        <RegenerateStaticTokenModal
          showModal={showModal}
          closeModal={() => setShowModal(false)}
          regenerateToken={mutate}
          isLoading={isLoading}
        />
      </div>
    </div>
  )
}

StaticAnalysisToken.propTypes = {
  staticAnalysisToken: PropTypes.string,
}

export default StaticAnalysisToken
