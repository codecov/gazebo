import PropTypes from 'prop-types'

import MyContextSwitcher from 'layouts/MyContextSwitcher'
import { providerFeedback } from 'shared/utils'
import Avatar from 'ui/Avatar'
import Banner from 'ui/Banner'
import Icon from 'ui/Icon'
import A from 'ui/A'

function Header({ owner, provider }) {
  return owner.isCurrentUserPartOfOrg ? (
    <>
      <Banner
        title={
          <div className="flex justify-center gap-2">
            <Icon name="speakerphone"></Icon>
            <h2>Updating our web app</h2>
          </div>
        }
      >
        <p>
          We’ve been making changes to the web experience and will be
          continuously releasing a new experience over the next few months. We
          would love to hear your feedback! Let us know what you think in{' '}
          <A
            hook="feedback"
            href={providerFeedback(provider)}
            isExternal={true}
          >
            this issue
          </A>
          .
        </p>
      </Banner>
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
