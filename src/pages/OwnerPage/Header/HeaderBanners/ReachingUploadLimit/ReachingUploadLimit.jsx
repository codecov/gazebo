import A from 'ui/A'
import Banner from 'ui/Banner'
import BannerContent from 'ui/Banner/BannerContent'
import BannerHeading from 'ui/Banner/BannerHeading'
import Button from 'ui/Button'

const ExceededUploadsAlert = () => (
  <Banner>
    <BannerHeading>
      <div className="flex justify-center gap-2">
        <h2>Upload limit almost reached</h2>
      </div>
    </BannerHeading>
    <BannerContent>
      <p className="text-ds-gray-quinary">
        This org is currently on the free plan; which includes 250 free uploads
        on a rolling monthly basis. This limit has been reached and the reports
        will not generate. To resolve this,{' '}
        <A to={{ pageName: 'upgradeOrgPlan' }}>upgrade plan</A> and you&apos;ll
        have unlimited uploads.
      </p>
      <div className="w-36 my-6">
        <Button to={{ pageName: 'upgradeOrgPlan' }} variant="primary">
          Upgrade plan
        </Button>
      </div>
      <p className="text-ds-gray-quinary">
        <span className="font-semibold">Need help?</span> Connect with our sales
        team today at <A to={{ pageName: 'sales' }}>sales@codecov.io</A>
      </p>
    </BannerContent>
  </Banner>
)

export default ExceededUploadsAlert
