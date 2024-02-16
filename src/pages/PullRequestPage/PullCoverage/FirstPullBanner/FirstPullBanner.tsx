import Banner from 'ui/Banner'
import BannerContent from 'ui/Banner/BannerContent'
import BannerHeading from 'ui/Banner/BannerHeading'

const FirstPullBanner: React.FC = () => {
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
