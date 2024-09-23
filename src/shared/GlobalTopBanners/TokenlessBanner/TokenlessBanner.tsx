import isString from 'lodash/isString'
import { useState } from 'react'
import { useParams } from 'react-router'

import { useOrgUploadToken } from 'services/orgUploadToken'
import { useOwner } from 'services/user'
import { useFlags } from 'shared/featureFlags'
import A from 'ui/A'
import Button from 'ui/Button'
import { CopyClipboard } from 'ui/CopyClipboard'
import Icon from 'ui/Icon'
import { Tooltip } from 'ui/Tooltip'
import TopBanner from 'ui/TopBanner'

interface UseParams {
  owner: string
}

interface UseOrgUploadTokenParams {
  provider: string
  owner: string
}

function OrgUploadTokenTooltip({ orgUploadToken }: { orgUploadToken: string }) {
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
          the token.
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

function AdminTokenlessBanner() {
  const { provider, owner } = useParams<UseOrgUploadTokenParams>()
  const { data: orgUploadToken } = useOrgUploadToken({
    provider,
    owner,
  })

  return (
    <TopBanner>
      <TopBanner.Start>
        <p className="items-center gap-1 md:flex">
          <span className="flex items-center gap-1 font-semibold">
            <Icon name="informationCircle" />
            Uploading with token is now required.
          </span>
          You must upload with{' '}
          {isString(orgUploadToken) ? (
            <OrgUploadTokenTooltip orgUploadToken={orgUploadToken} />
          ) : (
            'the token. '
          )}
          Admins can manage the
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

function MemberTokenlessBanner() {
  const { provider, owner } = useParams<UseOrgUploadTokenParams>()
  const { data: orgUploadToken } = useOrgUploadToken({
    provider,
    owner,
  })

  return (
    <TopBanner>
      <TopBanner.Start>
        <p className="items-center gap-1 md:flex">
          <span className="flex items-center gap-1 font-semibold">
            <Icon name="informationCircle" />
            Uploading with token is now required.
          </span>
          You must upload with
          {isString(orgUploadToken) ? (
            <OrgUploadTokenTooltip orgUploadToken={orgUploadToken} />
          ) : (
            'the token. '
          )}
          Contact your admins to manage the upload token settings.
        </p>
      </TopBanner.Start>
      <TopBanner.End>
        <TopBanner.DismissButton>Dismiss</TopBanner.DismissButton>
      </TopBanner.End>
    </TopBanner>
  )
}

function TokenlessBanner() {
  const { tokenlessSection } = useFlags({
    tokenlessSection: false,
  })
  const { owner } = useParams<UseParams>()

  const { data } = useOwner({
    username: owner,
    opts: { enabled: !!owner },
  })

  if (!owner || !tokenlessSection) return null // TODO: check for token if required for owner

  return !!data?.isAdmin ? <AdminTokenlessBanner /> : <MemberTokenlessBanner />
}

export default TokenlessBanner
