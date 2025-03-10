import { useState } from 'react'
import { useParams } from 'react-router'

import {
  ADMIN_TOKEN_REQUIRED_BANNER,
  MEMBER_TOKEN_REQUIRED_BANNER,
} from 'pages/AccountSettings/tabs/OrgUploadToken/TokenlessSection'
import { useUploadTokenRequired } from 'services/uploadTokenRequired'
import A from 'ui/A'
import Button from 'ui/Button'
import { CopyClipboard } from 'ui/CopyClipboard'
import Icon from 'ui/Icon'
import { Tooltip } from 'ui/Tooltip'
import TopBanner from 'ui/TopBanner'

interface UseParams {
  provider: string
  owner: string
}

interface UseUploadTokenRequiredParams {
  provider: string
  owner: string
}

const OrgUploadTokenTooltip: React.FC<{ orgUploadToken: string }> = ({
  orgUploadToken,
}) => {
  const [isTokenVisible, setIsTokenVisible] = useState(true)
  const encodedToken = orgUploadToken.replace(/\w|[^-]/g, 'x')
  const formattedToken = isTokenVisible ? orgUploadToken : encodedToken

  return (
    <Tooltip delayDuration={0} skipDelayDuration={400}>
      <Tooltip.Root>
        <Tooltip.Trigger
          className="font-semibold underline decoration-dotted decoration-1 underline-offset-4"
          data-testid="token-trigger"
        >
          the global upload token
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            className="bg-ds-gray-primary p-3 text-sm text-ds-gray-octonary"
            side="bottom"
          >
            <div className="flex items-center justify-center">
              {formattedToken}
              <div className="flex">
                <Button
                  variant="plain"
                  onClick={() => setIsTokenVisible(!isTokenVisible)}
                  to={undefined}
                  disabled={undefined}
                  hook="hide-and-show-org-token"
                >
                  <Icon
                    name={isTokenVisible ? 'eyeOff' : 'eye'}
                    className="text-ds-blue-darker"
                    label={isTokenVisible ? 'hide-token' : 'show-token'}
                  />
                </Button>
                <CopyClipboard
                  value={orgUploadToken}
                  data-testid="clipboard-copy-token"
                />
              </div>
            </div>
            <Tooltip.Arrow className="size-4 fill-ds-gray-primary" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip>
  )
}

const AdminTokenRequiredBanner: React.FC = () => {
  const { provider, owner } = useParams<UseUploadTokenRequiredParams>()
  const { data } = useUploadTokenRequired({
    provider,
    owner,
  })
  const orgUploadToken = data?.orgUploadToken

  return (
    <TopBanner localStorageKey={ADMIN_TOKEN_REQUIRED_BANNER}>
      <TopBanner.Start>
        <p className="items-center gap-1 md:flex">
          <span className="flex items-center gap-1 font-semibold">
            <Icon name="informationCircle" />
            You must now upload using a token.
          </span>
          Upload with either{' '}
          {typeof orgUploadToken === 'string' ? (
            <OrgUploadTokenTooltip orgUploadToken={orgUploadToken} />
          ) : (
            'the global upload token '
          )}
          or the repo upload token. Admins can manage the
          <A
            to={{
              pageName: 'orgUploadToken',
            }}
            hook="org-upload-token-link"
            isExternal={false}
          >
            global upload token settings.
          </A>
        </p>
      </TopBanner.Start>
      <TopBanner.End>
        <TopBanner.DismissButton>Dismiss</TopBanner.DismissButton>
      </TopBanner.End>
    </TopBanner>
  )
}

const MemberTokenRequiredBanner: React.FC = () => {
  const { provider, owner } = useParams<UseUploadTokenRequiredParams>()
  const { data } = useUploadTokenRequired({
    provider,
    owner,
  })

  const orgUploadToken = data?.orgUploadToken

  return (
    <TopBanner localStorageKey={MEMBER_TOKEN_REQUIRED_BANNER}>
      <TopBanner.Start>
        <p className="items-center gap-1 md:flex">
          <span className="flex items-center gap-1 font-semibold">
            <Icon name="informationCircle" />
            You must now upload using a token.
          </span>
          Upload with either{' '}
          {typeof orgUploadToken === 'string' ? (
            <OrgUploadTokenTooltip orgUploadToken={orgUploadToken} />
          ) : (
            'the global upload token '
          )}
          or the repo upload token. Contact your admins to manage the upload
          token settings.
        </p>
      </TopBanner.Start>
      <TopBanner.End>
        <TopBanner.DismissButton>Dismiss</TopBanner.DismissButton>
      </TopBanner.End>
    </TopBanner>
  )
}

const TokenRequiredBanner: React.FC = () => {
  const { provider, owner } = useParams<UseParams>()

  const { data } = useUploadTokenRequired({ provider, owner, enabled: !!owner })

  return data?.isAdmin ? (
    <AdminTokenRequiredBanner />
  ) : (
    <MemberTokenRequiredBanner />
  )
}

export default TokenRequiredBanner
