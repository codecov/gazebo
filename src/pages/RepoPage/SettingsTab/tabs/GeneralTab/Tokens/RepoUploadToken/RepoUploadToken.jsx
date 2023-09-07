import PropTypes from 'prop-types'
import { useState } from 'react'

import { useRegenerateRepoUploadToken } from 'services/repoUploadToken'
import { useAddNotification } from 'services/toastNotification'
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
  const { mutate, ...rest } = useRegenerateRepoUploadToken()

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
  const { regenerateToken, isLoading } = useRegenerateToken()

  if (!uploadToken) {
    return null
  }
  return (
    <div className="flex flex-col gap-2 border-2 border-ds-gray-primary p-4 sm:flex-row xl:w-4/5 2xl:w-3/5">
      <div className="flex flex-1 flex-col gap-3">
        <div className="flex flex-col">
          <h3 className="font-semibold">Repository upload token</h3>
          <span>
            Used for uploading coverage reports{' '}
            <A to={{ pageName: 'docs' }} isExternal>
              learn more
            </A>
          </span>
        </div>
        <p>Add this token to your codecov.yml</p>
        <TokenWrapper token={TokenFormatEnum.FIRST_FORMAT + uploadToken} />
        <span className="font-semibold ">OR</span>
        <p>
          If you’d like to add the token directly to your CI/CD Environment:
        </p>
        <TokenWrapper token={TokenFormatEnum.SECOND_FORMAT + uploadToken} />
      </div>
      <div>
        <Button
          hook="show-modal"
          onClick={() => setShowModal(true)}
          disabled={isLoading}
        >
          Regenerate
        </Button>
        <RegenerateTokenModal
          showModal={showModal}
          closeModal={() => setShowModal(false)}
          regenerateToken={regenerateToken}
          isLoading={isLoading}
        />
      </div>
    </div>
  )
}

RepoUploadToken.propTypes = {
  uploadToken: PropTypes.string,
}
export default RepoUploadToken
