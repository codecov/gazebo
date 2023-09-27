import { useParams } from 'react-router-dom'

import { ComparisonReturnType } from 'shared/utils/comparison'
import Banner from 'ui/Banner'
import BannerContent from 'ui/Banner/BannerContent'
import BannerHeading from 'ui/Banner/BannerHeading'

import { usePullPageData } from '../hooks'

const FirstPullBanner: React.FC = () => {
  const { provider, owner, repo, pullId } = useParams<{
    provider: string
    owner: string
    repo: string
    pullId: string
  }>()
  const { data } = usePullPageData({ provider, owner, repo, pullId })

  const resultType = data?.pull?.compareWithBase?.__typename
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
        reports and display the results here.
      </BannerContent>
    </Banner>
  )
}

export default FirstPullBanner
