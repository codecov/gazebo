import PropTypes from 'prop-types'
import { useState } from 'react'
import { useParams } from 'react-router-dom'

import { useRegenerateProfilingToken } from 'services/profilingToken'
import { useAddNotification } from 'services/toastNotification'
import TokenWrapper from 'shared/TokenWrapper'
import A from 'ui/A'
import Button from 'ui/Button'
import Modal from 'ui/Modal'

function useGenerateProfilingToken({ provider, owner, repo }) {
  const addToast = useAddNotification()
  const { mutate, ...rest } = useRegenerateProfilingToken({
    provider,
  })

  async function regenerateToken() {
    mutate(
      { owner, repoName: repo },
      {
        onError: () =>
          addToast({
            type: 'error',
            text: 'Something went wrong',
          }),
      }
    )
  }

  return { regenerateToken, ...rest }
}

const RegenerateProfilingTokenModel = ({
  closeModal,
  regenerateToken,
  isLoading,
}) => (
  <Modal
    isOpen={true}
    onClose={closeModal}
    title="New impact analysis token"
    body={
      <div className="flex  flex-col gap-4">
        <h2 className="font-semibold">Impact Analysis</h2>
        <p>If you save the new token, make sure to update your CI yml</p>
      </div>
    }
    footer={
      <div className="flex gap-2">
        <div>
          <Button hook="close-modal" onClick={closeModal}>
            Cancel
          </Button>
        </div>
        <div>
          <Button
            isLoading={isLoading}
            hook="generate-token"
            variant="primary"
            onClick={async () => {
              await regenerateToken()
              closeModal()
            }}
          >
            Generate New Token
          </Button>
        </div>
      </div>
    }
  />
)

RegenerateProfilingTokenModel.propTypes = {
  closeModal: PropTypes.func.isRequired,
  regenerateToken: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
}

function ImpactAnalysisToken({ profilingToken }) {
  const { provider, owner, repo } = useParams()
  const [showModal, setShowModal] = useState(false)
  const { regenerateToken, isLoading, data } = useGenerateProfilingToken({
    provider,
    owner,
    repo,
  })
  const token =
    data?.data?.regenerateProfilingToken?.profilingToken || profilingToken

  return (
    <div>
      <div className="flex gap-2">
        <h1 className="font-semibold text-lg mb-2">Impact analysis token</h1>
        <div>
          <Button variant="secondary">BETA</Button>
        </div>
      </div>
      <p className="mb-4">
        Token is used for impact analysis feature only{' '}
        <A to={{ pageName: 'docs' }} target="_blank">
          learn more
        </A>
      </p>
      <hr />
      <div className="mt-4 border-2 border-gray-100 p-4 flex xl:w-4/5 2xl:w-3/5">
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
            <RegenerateProfilingTokenModel
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
