import PropTypes from 'prop-types'
import { lazy, Suspense } from 'react'

import MyContextSwitcher from 'layouts/MyContextSwitcher'
import Avatar from 'ui/Avatar'

const HeaderBanners = lazy(() => import('./HeaderBanners/HeaderBanners'))

function Header({ owner, provider }) {
  if (owner.isCurrentUserPartOfOrg) {
    return (
      <>
        <Suspense fallback={null}>
          <HeaderBanners owner={owner} provider={provider} />
        </Suspense>
        <MyContextSwitcher pageName="owner" activeContext={owner.username} />
      </>
    )
  }

  return (
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
