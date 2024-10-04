import A from 'ui/A'
import Banner from 'ui/Banner'
import BannerContent from 'ui/Banner/BannerContent'

const FirstPullRequestBanner = () => {
  return (
    <Banner>
      <BannerContent>
        <p>
          Once merged to your default branch, Codecov will show your report
          results on this dashboard.{' '}
          <A
            to={{ pageName: 'configuration' }}
            hook={'repo-to-edit-branch'}
            variant="semibold"
            isExternal={false}
            data-testid="config-page"
          >
            edit default branch
          </A>
        </p>
      </BannerContent>
    </Banner>
  )
}

export default FirstPullRequestBanner
