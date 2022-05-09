import { useState } from 'react'
import { useParams } from 'react-router-dom'

import { useCommit } from 'services/commit'
import { useLegacyRedirects } from 'services/redirects'
import {
  getProviderCommitURL,
  getProviderPullURL,
  providerFeedback,
} from 'shared/utils'
import { formatTimeToNow } from 'shared/utils/dates'
import A from 'ui/A'
import Banner from 'ui/Banner'
import CIStatusLabel from 'ui/CIStatus'
import Icon from 'ui/Icon'

import PullLabel from './PullLabel'
import TruncatedMessage from './TruncatedMessage'

function Header() {
  const { provider, owner, repo, commit: commitSHA } = useParams()
  const { data } = useCommit({
    provider,
    owner,
    repo,
    commitid: commitSHA,
  })

  const [selectedOldUI, setSelectedOldUI] = useState(false)
  const cookiePath = `/${provider}/${owner}/`
  const { author, pullId, message, createdAt, branchName, ciPassed } =
    data?.commit

  const shortSHA = commitSHA?.slice(0, 7)
  const uri = `${cookiePath}${repo}/commit/${shortSHA}`

  useLegacyRedirects({
    cookieName: 'commit_detail_page',
    selectedOldUI,
    uri,
    cookiePath,
  })

  const providerPullUrl = getProviderPullURL({
    provider,
    owner,
    repo,
    pullId,
  })

  return (
    <div className="border-b border-ds-gray-secondary pb-4">
      <div className="mb-4">
        <Banner
          title={
            <div className="flex justify-center gap-2">
              <Icon name="speakerphone" />
              <h2>Updating our web app</h2>
            </div>
          }
        >
          <p>
            We’ve been making changes to the web experience and this page is a
            new look. If you prefer, you can{' '}
            <A
              to={{ pageName: 'legacyUI' }}
              options={{ pathname: uri }}
              onClick={() => setSelectedOldUI(true)}
            >
              switch back to the previous user interface
            </A>
            . Also, we would love to hear your feedback! Let us know what you
            think in{' '}
            <A
              hook="feedback"
              href={providerFeedback(provider)}
              isExternal={true}
            >
              this issue
            </A>
            .
          </p>
        </Banner>
      </div>
      {message && <TruncatedMessage message={message} />}
      <div className="flex gap-x-4">
        <div className="flex items-center text-ds-gray-quinary gap-2">
          <div>
            {createdAt && (
              <span className="font-light">{formatTimeToNow(createdAt)}</span>
            )}{' '}
            {/* TODO: deconstruct username from author in a const above once we have less statements (after removing the top banner) */}
            {author?.username && (
              <A
                to={{
                  pageName: 'owner',
                  options: { owner: author.username },
                }}
              >
                {author.username}
              </A>
            )}{' '}
            <span className="font-light">authored commit</span>{' '}
            <A
              variant="code"
              href={getProviderCommitURL({
                provider,
                owner,
                repo,
                commit: commitSHA,
              })}
              hook="provider commit url"
              isExternal={true}
            >
              {shortSHA}
            </A>
          </div>
          <CIStatusLabel ciPassed={ciPassed} />
          <span className="flex items-center">
            <Icon name="branch" variant="developer" size="sm" />
            {branchName}
          </span>
          <PullLabel
            pullId={pullId}
            provider={provider}
            providerPullUrl={providerPullUrl}
          />
        </div>
      </div>
    </div>
  )
}

export default Header
