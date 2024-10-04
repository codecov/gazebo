import Banner from 'ui/Banner'
import BannerContent from 'ui/Banner/BannerContent'
import BannerHeading from 'ui/Banner/BannerHeading'

export function AdminAuthorizationBanner() {
  return (
    <Banner>
      <BannerHeading>
        <h3 className="font-semibold">Admin authorization required</h3>
      </BannerHeading>
      <BannerContent>
        Requires organization administrator privileges. Please contact your
        GitHub administrator if you need access to configure Okta integration.
      </BannerContent>
    </Banner>
  )
}
