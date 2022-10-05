import A from 'ui/A'
import Banner from 'ui/Banner'
import BannerContent from 'ui/Banner/BannerContent'
import BannerHeading from 'ui/Banner/BannerHeading'

function AdminBanner() {
  return (
    <Banner>
      <BannerHeading>
        <h2 className="font-semibold">Managing users</h2>
      </BannerHeading>
      <BannerContent>
        <p>
          You can edit your organization users in the{' '}
          <A to={{ pageName: 'access' }}>admin management settings</A>.
        </p>
      </BannerContent>
    </Banner>
  )
}

export default AdminBanner
