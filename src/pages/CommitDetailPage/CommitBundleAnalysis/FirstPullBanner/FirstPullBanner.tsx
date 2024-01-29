import Banner from 'ui/Banner'
import BannerContent from 'ui/Banner/BannerContent'
import BannerHeading from 'ui/Banner/BannerHeading'

const FirstPullBanner: React.FC = () => {
  return (
    <Banner>
      <BannerHeading>
        <h2 className="flex justify-center gap-2 font-semibold">
          Welcome to bundle analysis &#127881;
        </h2>
      </BannerHeading>
      <BannerContent>
        Once merged to your default branch, Codecov will compare your bundle
        reports and display the results on pull request and commits.
      </BannerContent>
    </Banner>
  )
}

export default FirstPullBanner
