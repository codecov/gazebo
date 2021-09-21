import { providerFeedback } from 'shared/utils'
import { useLocation } from 'react-router-dom'
import { useState } from 'react'
import { useLegacyRedirects } from 'shared/utils/redirects'

import PropTypes from 'prop-types'
import Banner from 'ui/Banner'
import Icon from 'ui/Icon'
import A from 'ui/A'

function Header({ provider }) {
  const location = useLocation()
  const [selectedOldUI, setSelectedOldUI] = useState(false)
  useLegacyRedirects({
    cookieName: 'commit_detail_page',
    selectedOldUI,
    location,
  })

  return (
    <div className="my-4">
      <Banner
        title={
          <div className="flex justify-center gap-2">
            <Icon name="speakerphone"></Icon>
            <h2>Updating our web app</h2>
          </div>
        }
      >
        <p>
          We’ve been making changes to the web experience and this page is a new
          look. If you prefer, you can{' '}
          <A
            to={{ pageName: 'legacyUI' }}
            options={{ pathname: location.pathname }}
            onClick={() => setSelectedOldUI(true)}
          >
            switch back to the previous user interface
          </A>
          . Also, we would love to hear your feedback! Let us know what you
          think in{' '}
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
    </div>
  )
}

Header.propTypes = {
  provider: PropTypes.string.isRequired,
}

export default Header
