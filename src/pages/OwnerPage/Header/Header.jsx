import PropTypes from 'prop-types'

import config from 'config'

import MyContextSwitcher from 'layouts/MyContextSwitcher'
import { useIsUploadsNumberExceeded } from 'services/uploadsNumber'
import { providerFeedback } from 'shared/utils'
import A from 'ui/A'
import Avatar from 'ui/Avatar'
import Banner from 'ui/Banner'
import BannerContent from 'ui/Banner/BannerContent'
import BannerHeading from 'ui/Banner/BannerHeading'
import Button from 'ui/Button'
import Icon from 'ui/Icon'

const ExceededUploadsAlert = () => (
  <Banner>
    <BannerHeading>
      <div className="flex justify-center gap-2">
        <h2>Upload limit has been reached</h2>
      </div>
    </BannerHeading>
    <BannerContent>
      <p className="text-ds-gray-quinary">
        This org is currently on the free plan; which includes 250 free uploads
        on a rolling monthly basis. This limit has been reached and the reports
        will not generate. To resolve this,{' '}
        <A to={{ pageName: 'upgradeOrgPlan' }}>upgrade plan</A> and you’ll have
        unlimited uploads.
      </p>
      <div className="w-36 my-6">
        <Button to={{ pageName: 'upgradeOrgPlan' }} variant="primary">
          Upgrade plan
        </Button>
      </div>
      <p className="text-ds-gray-quinary">
        <span className="font-semibold">
          Do you have questions or need help?
        </span>{' '}
        Connect with our sales team today at{' '}
        <A to={{ pageName: 'sales' }}>sales@codecov.io</A>
      </p>
    </BannerContent>
  </Banner>
)

function Header({ owner, provider }) {
  const { username } = owner
  const { data: isUploadsExceeded } = useIsUploadsNumberExceeded({
    provider,
    owner: username,
  })

  return owner.isCurrentUserPartOfOrg ? (
    <>
      {isUploadsExceeded ? (
        <ExceededUploadsAlert />
      ) : (
        !config.IS_SELF_HOSTED && (
          <Banner>
            <BannerHeading>
              <div className="flex justify-center gap-2">
                <Icon name="speakerphone"></Icon>
                <h2>Updating our web app</h2>
              </div>
            </BannerHeading>
            <BannerContent>
              <p>
                We’ve been making changes to the web experience and will be
                continuously releasing a new experience over the next few
                months. We would love to hear your feedback! Let us know what
                you think in{' '}
                <A
                  hook="feedback"
                  href={providerFeedback(provider)}
                  isExternal={true}
                >
                  this issue
                </A>
                .
              </p>
            </BannerContent>
          </Banner>
        )
      )}
      <MyContextSwitcher pageName="owner" activeContext={owner.username} />
    </>
  ) : (
    <div className="flex items-center">
      <Avatar user={owner} bordered />
      <h2 className="mx-2 text-xl font-semibold">{owner.username}</h2>
    </div>
  )
}

Header.propTypes = {
  owner: PropTypes.shape({
    username: PropTypes.string.isRequired,
    isCurrentUserPartOfOrg: PropTypes.bool.isRequired,
  }).isRequired,
  provider: PropTypes.string.isRequired,
}

export default Header
