import Banner from 'ui/Banner'
import BannerContent from 'ui/Banner/BannerContent'
import BannerHeading from 'ui/Banner/BannerHeading'

function YamlErrorBanner() {
  return (
    <Banner variant="warning">
      <BannerHeading>
        <p className="font-semibold">Commit YAML is invalid</p>
      </BannerHeading>
      <BannerContent>
        Coverage data is unable to be displayed, as the commit YAML appears to
        be invalid.
      </BannerContent>
    </Banner>
  )
}

export default YamlErrorBanner
