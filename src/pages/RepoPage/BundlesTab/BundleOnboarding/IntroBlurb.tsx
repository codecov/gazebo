import A from 'ui/A'
import Banner from 'ui/Banner'
import Icon from 'ui/Icon'

const IntroBlurb = () => {
  return (
    <Banner>
      <div className="flex flex-col gap-2" data-testid="ba-intro-blurb">
        <h2 className="text-base font-semibold">Configure Bundle Analysis</h2>
        <p>
          Before integrating with Codecov, ensure that your project already uses
          one of the bundlers below as we use them to generate our analysis.
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
