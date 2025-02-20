import React from 'react'
import { useParams } from 'react-router'

import {
  ADMIN_TOKEN_NOT_REQUIRED_BANNER,
  MEMBER_TOKEN_NOT_REQUIRED_BANNER,
} from 'pages/AccountSettings/tabs/OrgUploadToken/TokenlessSection'
import { useUploadTokenRequired } from 'services/uploadTokenRequired'
import A from 'ui/A'
import Icon from 'ui/Icon'
import TopBanner from 'ui/TopBanner'

interface UseParams {
  provider: string
  owner: string
}

const AdminTokenNotRequiredBanner: React.FC = () => {
  return (
    <TopBanner localStorageKey={ADMIN_TOKEN_NOT_REQUIRED_BANNER}>
      <TopBanner.Start>
        <p className="items-center gap-1 md:flex">
          <span className="flex items-center gap-1 font-semibold">
            <Icon name="informationCircle" />
            Your org no longer requires upload tokens.
          </span>
          You can upload without a token. Admins manage the{' '}
          <A
            to={{
              pageName: 'orgUploadToken',
            }}
            hook="org-upload-token-settings-link"
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

const MemberTokenNotRequiredBanner: React.FC = () => {
  return (
    <TopBanner localStorageKey={MEMBER_TOKEN_NOT_REQUIRED_BANNER}>
      <TopBanner.Start>
        <p className="items-center gap-1 md:flex">
          <span className="flex items-center gap-1 font-semibold">
            <Icon name="informationCircle" />
            Your org no longer requires upload tokens.
          </span>
          You can upload without a token. Contact your admins to manage the
          global upload token settings.
        </p>
      </TopBanner.Start>
      <TopBanner.End>
        <TopBanner.DismissButton>Dismiss</TopBanner.DismissButton>
      </TopBanner.End>
    </TopBanner>
  )
}

const TokenNotRequiredBanner: React.FC = () => {
  const { provider, owner } = useParams<UseParams>()
  const { data } = useUploadTokenRequired({ provider, owner, enabled: !!owner })

  return data?.isAdmin ? (
    <AdminTokenNotRequiredBanner />
  ) : (
    <MemberTokenNotRequiredBanner />
  )
}

export default TokenNotRequiredBanner
