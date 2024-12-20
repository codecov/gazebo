import { useState } from 'react'
import { useParams } from 'react-router-dom'

import { useIsCurrentUserAnAdmin } from 'services/user'
import Button from 'ui/Button'
import Icon from 'ui/Icon'
import TokenWrapper from 'ui/TokenWrapper'

import RegenerateTokenModal from './RegenrateTokenModal'
import useGenerateOrgUploadToken from './useGenerateOrgUploadToken'

const TokenFormatEnum = Object.freeze({
  FIRST_FORMAT: 'codecov: \n token: ',
  SECOND_FORMAT: 'CODECOV_TOKEN=',
})

const UploadToken = ({ token, format }: { token: string; format: string }) => {
  const [hideClipboard, setHideClipboard] = useState(true)
  const encodedToken = hideClipboard
    ? format + token.replace(/[^w-]|/g, 'x')
    : undefined

  return (
    <div className="flex items-center gap-2">
      <TokenWrapper token={format + token} encodedToken={encodedToken} />
      <div
        className="flex gap-0.5 text-ds-blue-darker hover:cursor-pointer"
        onClick={() => setHideClipboard(!hideClipboard)}
        data-testid="hide-token"
      >
        <Icon
          name={hideClipboard ? 'eye' : 'eyeOff'}
          size="sm"
          variant="solid"
        />
        <span className="text-xs font-semibold">
          {hideClipboard ? 'Show' : 'Hide'}
        </span>
      </div>
    </div>
  )
}

interface URLParams {
  provider: string
  owner: string
}

function RegenerateOrgUploadToken({
  orgUploadToken,
}: {
  orgUploadToken: string
}) {
  const { owner } = useParams<URLParams>()
  const { regenerateToken, isLoading } = useGenerateOrgUploadToken()
  const [showModal, setShowModal] = useState(false)
  const isAdmin = useIsCurrentUserAnAdmin({ owner })

  return (
    <div className="flex">
      <div className="flex flex-1 flex-col gap-4">
        <p>Add this token to your codecov.yml</p>
        <UploadToken
          token={orgUploadToken}
          format={TokenFormatEnum.FIRST_FORMAT}
        />
        <span className="font-semibold ">OR</span>
        <UploadToken
          token={orgUploadToken}
          format={TokenFormatEnum.SECOND_FORMAT}
        />
        {!isAdmin && (
          <div className="flex gap-1">
            <Icon name="informationCircle" size="sm" />
            Only organization admins can regenerate this token.
          </div>
        )}
      </div>
      <div>
        <Button
          hook="show-modal"
          onClick={() => setShowModal(true)}
          disabled={isLoading || !isAdmin}
        >
          Regenerate
        </Button>
        {showModal && (
          <RegenerateTokenModal
            closeModal={() => setShowModal(false)}
            regenerateToken={() => Promise.resolve(regenerateToken())}
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  )
}

export default RegenerateOrgUploadToken
