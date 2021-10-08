import { providerFeedback } from 'shared/utils'
import { useState } from 'react'
import { useLegacyRedirects } from 'services/redirects'

import PropTypes from 'prop-types'
import Banner from 'ui/Banner'
import Icon from 'ui/Icon'
import A from 'ui/A'

function Header({ provider, owner, repo, commit }) {
  const [selectedOldUI, setSelectedOldUI] = useState(false)
  const cookiePath = `/${provider}/${owner}`
  const uri = `${cookiePath}${repo}/commit/${commit}`

  useLegacyRedirects({
    cookieName: 'commit_detail_page',
    selectedOldUI,
    uri,
    cookiePath,
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
            options={{ pathname: uri }}
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
  owner: PropTypes.string.isRequired,
  repo: PropTypes.string.isRequired,
  commit: PropTypes.string.isRequired,
}

export default Header
