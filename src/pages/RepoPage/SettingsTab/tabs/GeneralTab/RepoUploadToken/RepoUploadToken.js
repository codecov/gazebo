import PropTypes from 'prop-types'
import { useState } from 'react'
import { useParams } from 'react-router-dom'

import { useAddNotification } from 'services/toastNotification'
import { useRegenerateUploadToken } from 'services/uploadToken'
import TokenWrapper from 'shared/TokenWrapper'
import A from 'ui/A'
import Button from 'ui/Button'
import Modal from 'ui/Modal'

const TokenFormatEnum = Object.freeze({
  FIRST_FORMAT: 'codecov: \n token: ',
  SECOND_FORMAT: 'CODECOV_TOKEN=',
})

function useRegenerateToken({ provider, owner, repo }) {
  const addToast = useAddNotification()
  const { mutate, ...rest } = useRegenerateUploadToken({
    provider,
    owner,
    repo,
  })

  async function regenerateToken() {
    mutate(null, {
      onError: () =>
        addToast({
          type: 'error',
          text: 'Something went wrong',
        }),
    })
  }

  return { regenerateToken, ...rest }
}

const RegenerateTokenModel = ({ closeModal, regenerateToken, isLoading }) => (
  <Modal
    isOpen={true}
    onClose={closeModal}
    title="New upload token"
    body={
      <div className="flex  flex-col gap-4">
        <h2 className="font-semibold"> Personal API token</h2>
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

RegenerateTokenModel.propTypes = {
  closeModal: PropTypes.func.isRequired,
  regenerateToken: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
}

function RepoUploadToken({ uploadToken }) {
  const { provider, owner, repo } = useParams()
  const [showModal, setShowModal] = useState(false)
  const { regenerateToken, isLoading, data } = useRegenerateToken({
    provider,
    owner,
    repo,
  })
  const token = data?.uploadToken || uploadToken

  return (
    <div>
      <h1 className="font-semibold text-lg mb-2">Repository upload token</h1>
      <p className="mb-4">
        Token is used for uploading coverage reports{' '}
        <A to={{ pageName: 'docs' }} target="_blank">
          learn more
        </A>
      </p>
      <hr />
      <div className="mt-4 border-2 border-gray-100 p-4 flex xl:w-4/5 2xl:w-3/5">
        <div className="flex-1 flex flex-col gap-4">
          <p>Add this token to your codecov.yml</p>
          <p className="text-xs">
            <span className="font-semibold">Note:</span> Token not required for
            public repositories uploading from Travis, CircleCI, AppVeyor, Azure
            Pipelines or{' '}
            <A
              href="https://github.com/codecov/codecov-action#usage"
              isExternal
              hook="gh-actions"
            >
              GitHub Actions
            </A>
            .
          </p>
          <TokenWrapper token={TokenFormatEnum.FIRST_FORMAT + token} />
          <h1 className="font-semibold ">OR</h1>
          <TokenWrapper token={TokenFormatEnum.SECOND_FORMAT + token} />
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
            <RegenerateTokenModel
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

RepoUploadToken.propTypes = {
  uploadToken: PropTypes.string.isRequired,
}
export default RepoUploadToken
