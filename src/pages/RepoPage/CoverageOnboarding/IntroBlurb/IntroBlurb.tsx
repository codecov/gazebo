import A from 'ui/A'
import Icon from 'ui/Icon'

const IntroBlurb = () => {
  return (
    <div
      className="flex flex-col gap-2 overflow-auto border-l-4 border-ds-blue bg-ds-gray-primary p-4"
      data-testid="intro-blurb"
    >
      Before integrating with Codecov, ensure that your project already
      generates coverage reports. Codecov relies on these reports to provide the
      coverage analysis.
      <A
        to={{ pageName: 'quickStart' }}
        isExternal
        hook="quick-start-link-circle-ci-repo"
      >
        <Icon name="bookOpen" size="sm" />
        Read our documentation
      </A>
    </div>
  )
}

export default IntroBlurb
