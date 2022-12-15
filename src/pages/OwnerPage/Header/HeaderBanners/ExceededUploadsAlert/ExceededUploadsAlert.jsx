import A from 'ui/A'
import Banner from 'ui/Banner'
import BannerContent from 'ui/Banner/BannerContent'
import BannerHeading from 'ui/Banner/BannerHeading'
import Button from 'ui/Button'

const ExceededUploadsAlert = () => (
  <Banner>
    <BannerHeading>
      <h2 className="font-semibold">Upload limit has been reached</h2>
    </BannerHeading>
    <BannerContent>
      <p>
        This org is currently on the free plan; which includes 250 free uploads
        monthly. This month&apos;s period has been reached and the reports will
        not generate. To resolve this,{' '}
        <A to={{ pageName: 'upgradeOrgPlan' }}>upgrade plan</A> and you&apos;ll
        have unlimited uploads.
      </p>
      <div className="w-36 my-6">
        <Button to={{ pageName: 'upgradeOrgPlan' }} variant="primary">
          Upgrade plan
        </Button>
      </div>
      <p>
        <span className="font-semibold">Need help?</span> Connect with our sales
        team today at <A to={{ pageName: 'sales' }}>sales@codecov.io</A>
      </p>
    </BannerContent>
  </Banner>
)

export default ExceededUploadsAlert
