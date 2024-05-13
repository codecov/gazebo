import A from 'ui/A'
import Banner from 'ui/Banner'
import Icon from 'ui/Icon'

const IntroBlurb = () => {
  return (
    <Banner>
      <div className="flex flex-col gap-2" data-testid="ba-intro-blurb">
        <h2 className="text-base font-semibold">Configure Bundle Analysis</h2>
        <p>
          Bundle Analysis helps improve your application&apos;s performance,
          bandwidth usage, and load times by letting you know if what you’re
          about to merge will cause any performance regressions. It will allow
          you to explore all of the modules in your bundle and determine where
          you might be able to streamline your bundle size as well as find areas
          of concern.
        </p>
        <A
          to={{ pageName: 'bundleAnalysisDocs' }}
          isExternal
          hook="quick-start-link-bundle-analysis"
        >
          <Icon name="bookOpen" size="sm" />
          Read our documentation
        </A>
      </div>
    </Banner>
  )
}

export default IntroBlurb
