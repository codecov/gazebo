import PropTypes from 'prop-types'
import { useState } from 'react'
import { useParams } from 'react-router'

import { useRegenerateRepoUploadToken } from 'services/repoUploadToken'
import { useUploadTokenRequired } from 'services/uploadTokenRequired'
import A from 'ui/A'
import Button from 'ui/Button'
import TokenWrapper from 'ui/TokenWrapper'

import RegenerateTokenModal from './RegenerateTokenModal'

const TokenFormatEnum = Object.freeze({
  FIRST_FORMAT: 'codecov: \n token: ',
  SECOND_FORMAT: 'CODECOV_TOKEN=',
})

function useRegenerateToken() {
  const { mutate, isLoading } = useRegenerateRepoUploadToken()
  return { mutate, isLoading }
}

function RepoUploadToken({ uploadToken }) {
  const { provider, owner } = useParams()
  const [showModal, setShowModal] = useState(false)
  const { mutate, isLoading } = useRegenerateToken()
  const { data } = useUploadTokenRequired({
    provider,
    owner,
    enabled: !!uploadToken,
  })

  if (!uploadToken) {
    return null
  }

  return (
    <div className="flex flex-col gap-2">
      {!data?.uploadTokenRequired ? (
        <p className="mb-2">
          Uploading with token is now not required. You can upload without a
          token. Contact your admins to manage the global upload token settings.
        </p>
      ) : null}
      <div className="flex flex-col gap-2 border-2 border-ds-gray-primary p-4 sm:flex-row">
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
            If you&apos;d like to add the token directly to your CI/CD
            Environment:
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
            regenerateToken={mutate}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  )
}

RepoUploadToken.propTypes = {
  uploadToken: PropTypes.string,
}
export default RepoUploadToken
