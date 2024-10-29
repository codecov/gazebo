import A from 'ui/A'
import Banner from 'ui/Banner'
import BannerContent from 'ui/Banner/BannerContent'
import BannerHeading from 'ui/Banner/BannerHeading'

function YamlErrorBanner() {
  return (
    <Banner variant="warning">
      <BannerHeading>
        <p className="font-semibold">
          <A to="" isExternal={true}>
            YAML
          </A>{' '}
          is invalid
        </p>
      </BannerHeading>
      <BannerContent>
        Coverage data is unable to be displayed, as the commit YAML appears to
        be invalid. The{' '}
        <A to="" isExternal={true}>
          yaml validator
        </A>{' '}
        can help determine its validation.
      </BannerContent>
    </Banner>
  )
}

export default YamlErrorBanner
