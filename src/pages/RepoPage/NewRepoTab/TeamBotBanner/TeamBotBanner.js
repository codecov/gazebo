import A from 'ui/A'
import Banner from 'ui/Banner'
import BannerContent from 'ui/Banner/BannerContent'
import BannerHeading from 'ui/Banner/BannerHeading'

function TeamBotBanner() {
  return (
    <Banner variant="plain">
      <BannerHeading>
        <div className="font-semibold text-sm">
          Next, set up a <A to={{ pageName: 'teamBot' }}>team Bot</A>
        </div>
      </BannerHeading>
      <BannerContent>
        Codecov will use the integration to post statuses and comments. If
        you’re using GitHub, the best way to integrate with Codecov.io is to
        Install{' '}
        <A to={{ pageName: 'codecovGithubApp' }}>Codecov&apos;s GitHub App</A>.
      </BannerContent>
    </Banner>
  )
}

export default TeamBotBanner
