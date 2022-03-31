import formatDistanceToNow from 'date-fns/formatDistanceToNow'
import PropTypes from 'prop-types'
import { useState } from 'react'

import { useLegacyRedirects } from 'services/redirects'
import {
  getProviderCommitURL,
  getProviderPullURL,
  providerFeedback,
} from 'shared/utils'
import A from 'ui/A'
import Banner from 'ui/Banner'
import Icon from 'ui/Icon'

import CIStatusLabel from './CIStatusLabel'
import PullLabel from './PullLabel'

function Header({ provider, owner, repo, commit }) {
  const [selectedOldUI, setSelectedOldUI] = useState(false)
  const cookiePath = `/${provider}/${owner}/`
  const {
    author,
    pullId,
    message,
    createdAt,
    branchName,
    commitid: commitSHA,
  } = commit
  const shortSHA = commitSHA?.slice(0, 7)
  const uri = `${cookiePath}${repo}/commit/${shortSHA}`

  const username = author?.username

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
    pullId: pullId,
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
      <h1 className="text-lg font-semibold text-ds-gray-octonary">{message}</h1>
      <div className="flex gap-x-4">
        <div className="flex items-center text-ds-gray-quinary gap-1">
          <div>
            <span className="font-light">
              {createdAt
                ? formatDistanceToNow(new Date(createdAt), {
                    addSuffix: true,
                  })
                : ''}
            </span>{' '}
            {username && (
              <A
                to={{
                  pageName: 'owner',
                  options: { owner: username },
                }}
              >
                {username}
              </A>
            )}{' '}
            <span className="font-light">authored commit</span>
          </div>
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
          <CIStatusLabel ciPassed={commit.ciPassed} />
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

Header.propTypes = {
  provider: PropTypes.string.isRequired,
  owner: PropTypes.string.isRequired,
  repo: PropTypes.string.isRequired,
  commit: PropTypes.any,
}

export default Header
