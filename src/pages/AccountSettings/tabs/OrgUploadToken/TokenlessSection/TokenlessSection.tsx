import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import { useUploadTokenRequired } from 'services/uploadTokenRequired'
import { Provider } from 'shared/api/helpers'
import A from 'ui/A'
import { Card } from 'ui/Card'
import { RadioTileGroup } from 'ui/RadioTileGroup'

import TokenRequiredModal from './TokenRequiredModal'
import { useSetUploadTokenRequired } from './useSetUploadTokenRequired'

const AUTHENTICATION_OPTIONS = {
  NotRequired: 'not-required',
  Required: 'required',
} as const

interface UseParams {
  provider: Provider
  owner: string
}

const TokenlessSection: React.FC = () => {
  const { provider, owner } = useParams<UseParams>()
  const {
    data: uploadTokenRequiredData,
    isLoading: isUploadTokenRequiredLoading,
  } = useUploadTokenRequired({ provider, owner })
  const { mutate, isPending: isSetUploadTokenRequiredPending } =
    useSetUploadTokenRequired({ provider, owner })

  const [showModal, setShowModal] = useState<boolean>(false)
  const [tokenRequired, setTokenRequiredState] = useState<boolean>(true)

  useEffect(() => {
    if (
      !isUploadTokenRequiredLoading &&
      uploadTokenRequiredData &&
      uploadTokenRequiredData?.uploadTokenRequired !== null
    ) {
      setTokenRequiredState(uploadTokenRequiredData.uploadTokenRequired)
    }
  }, [uploadTokenRequiredData, isUploadTokenRequiredLoading])

  const handleValueChange = (value: string) => {
    if (value === AUTHENTICATION_OPTIONS.Required) {
      setShowModal(true)
    } else {
      setTokenRequiredState(false)
      mutate(false)
    }
  }

  return (
    <Card>
      <Card.Header>
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold">
            Token authentication for public repositories
          </h2>
          <A
            to={{
              pageName: 'tokenlessDocs',
            }}
            hook="tokenless-docs"
            isExternal={true}
          >
            <span className="text-ds-primary">learn more</span>
          </A>
        </div>
      </Card.Header>
      <Card.Content>
        <p className="mb-3">Select an authentication option</p>
        <RadioTileGroup
          value={
            tokenRequired
              ? AUTHENTICATION_OPTIONS.Required
              : AUTHENTICATION_OPTIONS.NotRequired
          }
          name="token-authentication"
          onValueChange={handleValueChange}
        >
          <RadioTileGroup.Item
            value={AUTHENTICATION_OPTIONS.NotRequired}
            data-testid="token-not-required-radio"
          >
            <RadioTileGroup.Label>Not required</RadioTileGroup.Label>
            <RadioTileGroup.Description>
              When a token is not required, your team can upload coverage
              reports without one. Existing tokens will still work, and no
              action is needed for past uploads.
            </RadioTileGroup.Description>
          </RadioTileGroup.Item>
          <RadioTileGroup.Item
            value={AUTHENTICATION_OPTIONS.Required}
            data-testid="token-required-radio"
          >
            <RadioTileGroup.Label>Required</RadioTileGroup.Label>
            <RadioTileGroup.Description>
              When a token is required, your team must use a global or
              repo-specific token for uploads.
            </RadioTileGroup.Description>
          </RadioTileGroup.Item>
        </RadioTileGroup>
        {showModal && (
          <TokenRequiredModal
            closeModal={() => setShowModal(false)}
            setTokenRequired={(value) => {
              setTokenRequiredState(value)
              mutate(true)
            }}
            isLoading={isSetUploadTokenRequiredPending}
          />
        )}
      </Card.Content>
    </Card>
  )
}

export default TokenlessSection
