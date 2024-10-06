import { useParams } from 'react-router'

import { useUploadTokenRequired } from 'services/uploadTokenRequired'
import { useFlags } from 'shared/featureFlags'
import A from 'ui/A'
import Icon from 'ui/Icon'
import TopBanner from 'ui/TopBanner'

interface UseParams {
  provider: string
  owner: string
}

function AdminTokenNotRequiredBanner() {
  return (
    <TopBanner localStorageKey="admin-token-not-required-banner">
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

function MemberTokenNotRequiredBanner() {
  return (
    <TopBanner localStorageKey="member-token-not-required-banner">
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

function TokenNotRequiredBanner() {
  const { tokenlessSection } = useFlags({
    tokenlessSection: false,
  })

  const { provider, owner } = useParams<UseParams>()

  const { data } = useUploadTokenRequired({ provider, owner, enabled: !!owner })
  if (!tokenlessSection || !owner || data?.uploadTokenRequired) return null

  return data?.isAdmin ? (
    <AdminTokenNotRequiredBanner />
  ) : (
    <MemberTokenNotRequiredBanner />
  )
}

export default TokenNotRequiredBanner
