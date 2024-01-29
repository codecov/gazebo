import { useParams } from 'react-router-dom'

import { useCommitPageData } from 'pages/CommitDetailPage/hooks'
import { ComparisonReturnType } from 'shared/utils/comparison'
import Banner from 'ui/Banner'
import BannerContent from 'ui/Banner/BannerContent'
import BannerHeading from 'ui/Banner/BannerHeading'

interface URLParams {
  provider: string
  owner: string
  repo: string
  commit: string
}

const FirstPullBanner: React.FC = () => {
  const { provider, owner, repo, commit } = useParams<URLParams>()
  const { data } = useCommitPageData({
    provider,
    owner,
    repo,
    commitId: commit,
  })

  const resultType = data?.commit?.compareWithParent?.__typename
  if (resultType !== ComparisonReturnType.FIRST_PULL_REQUEST) {
    return null
  }

  return (
    <Banner>
      <BannerHeading>
        <h2 className="flex justify-center gap-2 font-semibold">
          Welcome to Codecov &#127881;
        </h2>
      </BannerHeading>
      <BannerContent>
        Once merged to your default branch, Codecov will compare your coverage
        reports and display the on pull requests and commits.
      </BannerContent>
    </Banner>
  )
}

export default FirstPullBanner
