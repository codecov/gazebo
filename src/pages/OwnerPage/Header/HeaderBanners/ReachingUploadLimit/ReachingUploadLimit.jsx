import PropTypes from 'prop-types'

import A from 'ui/A'
import Banner from 'ui/Banner'
import BannerContent from 'ui/Banner/BannerContent'
import BannerHeading from 'ui/Banner/BannerHeading'
import Button from 'ui/Button'

const ExceededUploadsAlert = ({ planName, monthlyUploadLimit }) => (
  <Banner>
    <BannerHeading>
      <h2 className="font-semibold">Upload limit almost reached</h2>
    </BannerHeading>
    <BannerContent>
      <p>
        This org is currently on the {planName} plan; which includes{' '}
        {monthlyUploadLimit} free uploads monthly. This month&apos;s limit is
        nearly reached and the reports will not generate. To resolve this,{' '}
        <A to={{ pageName: 'upgradeOrgPlan' }}>upgrade plan</A> and you&apos;ll
        have unlimited uploads.
      </p>
      <div className="my-6 w-36">
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

ExceededUploadsAlert.propTypes = {
  planName: PropTypes.string.isRequired,
  monthlyUploadLimit: PropTypes.number.isRequired,
}

export default ExceededUploadsAlert
