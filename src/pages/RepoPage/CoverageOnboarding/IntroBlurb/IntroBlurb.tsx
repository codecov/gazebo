import A from 'ui/A'
import Banner from 'ui/Banner'
import Icon from 'ui/Icon'

const IntroBlurb = () => {
  return (
    <Banner>
      <div className="flex flex-col gap-2" data-testid="intro-blurb">
        <h2 className="text-base font-semibold">
          Let&apos;s get your repo covered
        </h2>
        <p>
          Before integrating with Codecov, ensure that your project already
          generates coverage reports. Codecov relies on these reports to provide
          the coverage analysis.
        </p>
        <A
          to={{ pageName: 'quickStart' }}
          isExternal
          hook="quick-start-link-circle-ci-repo"
        >
          <Icon name="bookOpen" size="sm" />
          Read our documentation
        </A>
      </div>
    </Banner>
  )
}

export default IntroBlurb
