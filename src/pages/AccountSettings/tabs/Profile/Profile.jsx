import PropTypes from 'prop-types'
import { useContext } from 'react'
import { Redirect } from 'react-router-dom'

import { useSelfHostedCurrentUser } from 'services/selfHosted'
import { useFlags } from 'shared/featureFlags'
import { ThemeContext } from 'shared/ThemeContext'
import Toggle from 'ui/Toggle'

import ActivationBanner from './ActivationBanner'
import AdminBanner from './AdminBanner'
import DeletionCard from './DeletionCard'
import NameEmailCard from './NameEmailCard'

const colorblindTheme = 'color-blind'
function Profile({ provider, owner }) {
  const yamlTab = `/account/${provider}/${owner}/yaml/`
  const { data: currentUser } = useSelfHostedCurrentUser()

  const isPersonalSettings =
    currentUser?.username?.toLowerCase() === owner?.toLowerCase()

  const { showThemeToggle } = useFlags({ showThemeToggle: false })
  const { theme, setTheme } = useContext(ThemeContext)

  if (!isPersonalSettings) {
    return <Redirect to={yamlTab} />
  }

  return (
    <div className="flex flex-col gap-4">
      {showThemeToggle && (
        <div className="flex justify-end">
          <Toggle
            label="Colorblind Friendly"
            value={theme === colorblindTheme}
            onClick={() => {
              if (theme !== colorblindTheme) {
                setTheme(colorblindTheme)
              } else {
                setTheme('')
              }
            }}
          />
        </div>
      )}
      {currentUser?.isAdmin && <AdminBanner />}
      <ActivationBanner />
      <NameEmailCard currentUser={currentUser} provider={provider} />
      <DeletionCard
        provider={provider}
        owner={owner}
        isPersonalSettings={isPersonalSettings}
      />
    </div>
  )
}

Profile.propTypes = {
  provider: PropTypes.string.isRequired,
  owner: PropTypes.string.isRequired,
}

export default Profile
