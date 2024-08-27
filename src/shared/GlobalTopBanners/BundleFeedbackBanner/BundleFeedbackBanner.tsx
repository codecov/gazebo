import { useParams } from 'react-router-dom'

import { useRepoOverview } from 'services/repo'
import A from 'ui/A'
import TopBanner from 'ui/TopBanner'

const BUNDLE_FEEDBACK_BANNER_KEY = 'bundle-feedback-banner'

interface URLParams {
  provider: string
  owner: string
  repo?: string
}

const BundleFeedbackBanner = () => {
  const { provider, owner, repo } = useParams<URLParams>()
  const { data: repoOverview, isSuccess } = useRepoOverview({
    provider,
    owner,
    repo: repo || '', // if repo undefined, query is disabled
    opts: { enabled: !!repo },
  })

  const showBanner = repo && isSuccess && repoOverview?.bundleAnalysisEnabled

  if (!showBanner) {
    return null
  }

  return (
    <TopBanner localStorageKey={BUNDLE_FEEDBACK_BANNER_KEY}>
      <TopBanner.Start>
        <p className="items-center gap-1 md:flex">
          &#127775;{' '}
          <span className="font-semibold">
            Looks like your org tried{' '}
            <A
              to={{ pageName: 'bundles' }}
              isExternal={false}
              hook="bundle-feedback-BA-link"
            >
              bundle analysis
            </A>
            !
          </span>
          We&apos;d love your thoughts and feedback in this
          <A
            to={{ pageName: 'bundleFeedbackSurvey' }}
            isExternal
            hook="bundle-feedback-link"
          >
            1 minute survey.
          </A>
        </p>
      </TopBanner.Start>
      <TopBanner.End>
        <TopBanner.DismissButton>
          <span className="opacity-100"> Dismiss </span>
        </TopBanner.DismissButton>
      </TopBanner.End>
    </TopBanner>
  )
}

export default BundleFeedbackBanner
