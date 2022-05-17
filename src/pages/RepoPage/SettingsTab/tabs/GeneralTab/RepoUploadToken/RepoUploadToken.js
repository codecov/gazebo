import PropTypes from 'prop-types'
import { useParams } from 'react-router-dom'

import { useAddNotification } from 'services/toastNotification'
import { useRegenerateUploadToken } from 'services/uploadToken'
import A from 'ui/A'
import Button from 'ui/Button'
import CopyClipboard from 'ui/CopyClipboard'

const TokenFormatEnum = Object.freeze({
  FIRST_FORMAT: 'codecov: \n token: ',
  SECOND_FORMAT: 'CODECOV_TOKEN=',
})

const TokenWrapper = ({ uploadToken }) => {
  return (
    <div className="flex flex-row">
      <pre className="font-mono bg-ds-gray-secondary text-ds-gray-octonary h-auto">
        {uploadToken}
      </pre>
      <CopyClipboard string={uploadToken} />
    </div>
  )
}

TokenWrapper.propTypes = {
  uploadToken: PropTypes.string.isRequired,
}

function useRegenerateToken({ provider, owner, repo }) {
  const addToast = useAddNotification()
  const { mutate, ...rest } = useRegenerateUploadToken({
    provider,
    owner,
    repo,
  })

  function regenerateToken() {
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
  const { provider, owner, repo } = useParams()
  const { regenerateToken, data } = useRegenerateToken({
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
      <hr></hr>
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
          <TokenWrapper uploadToken={TokenFormatEnum.FIRST_FORMAT + token} />
          <h1 className="font-semibold ">OR</h1>
          <TokenWrapper uploadToken={TokenFormatEnum.SECOND_FORMAT + token} />
        </div>
        <div>
          <Button onClick={() => regenerateToken()}>Regenerate</Button>
        </div>
      </div>
    </div>
  )
}

RepoUploadToken.propTypes = {
  uploadToken: PropTypes.string,
}
export default RepoUploadToken
