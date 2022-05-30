import PropTypes from 'prop-types'
import { useState } from 'react'

import { useAddNotification } from 'services/toastNotification'
import { useRegenerateUploadToken } from 'services/uploadToken'
import A from 'ui/A'
import Button from 'ui/Button'
import TokenWrapper from 'ui/TokenWrapper'

import RegenerateTokenModal from './RegenerateTokenModal'

const TokenFormatEnum = Object.freeze({
  FIRST_FORMAT: 'codecov: \n token: ',
  SECOND_FORMAT: 'CODECOV_TOKEN=',
})

function useRegenerateToken() {
  const addToast = useAddNotification()
  const { mutate, ...rest } = useRegenerateUploadToken()

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

function RepoUploadToken({ uploadToken }) {
  const [showModal, setShowModal] = useState(false)
  const { regenerateToken, isLoading, data } = useRegenerateToken()
  const token = data?.uploadToken || uploadToken

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <h1 className="font-semibold text-lg ">Repository upload token</h1>
        <p>
          Token is used for uploading coverage reports{' '}
          <A to={{ pageName: 'docs' }} isExternal>
            learn more
          </A>
        </p>
        <hr />
      </div>
      <div className="border-2 border-gray-100 p-4 flex xl:w-4/5 2xl:w-3/5">
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
          <span className="font-semibold ">OR</span>
          <p>
            If you’d like to add the token directly to your CI/CD Environment:
          </p>
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
            <RegenerateTokenModal
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
