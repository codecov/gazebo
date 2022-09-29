import PropTypes from 'prop-types'
import { useState } from 'react'

import { useUser } from 'services/user'
import { useFlags } from 'shared/featureFlags'
import Toggle from 'ui/Toggle'

import DeletionCard from './DeletionCard'
import GithubIntegrationCard from './GithubIntegrationCard'
import ManageAdminCard from './ManageAdminCard'
import NameEmailCard from './NameEmailCard'
import StudentCard from './StudentCard'

const colorblindTheme = 'color-blind'

function Admin({ provider, owner }) {
  const { data: currentUser } = useUser({ provider })
  const isPersonalSettings =
    currentUser.user.username.toLowerCase() === owner.toLowerCase()

  const theme = localStorage.getItem('current-theme')
  const [themeValue, setThemeValue] = useState(theme === colorblindTheme)
  const { showThemeToggle } = useFlags({ showThemeToggle: false })

  const handleThemeChange = () => {
    if (theme !== colorblindTheme) {
      localStorage.setItem('current-theme', colorblindTheme)
    } else {
      localStorage.setItem('current-theme', '')
    }
    setThemeValue(!themeValue)
  }

  return (
    <div className={`flex flex-col gap-4 ${theme}`}>
      {showThemeToggle && (
        <div className="flex justify-end">
          <Toggle
            label="Colorblind Friendly"
            value={themeValue}
            onClick={handleThemeChange}
          />
        </div>
      )}
      {isPersonalSettings ? (
        <>
          <NameEmailCard currentUser={currentUser} provider={provider} />
          <StudentCard currentUser={currentUser} />
        </>
      ) : (
        <ManageAdminCard />
      )}
      <div className="mt-8 flex flex-col md:flex-row">
        <GithubIntegrationCard provider={provider} owner={owner} />
        <div className="grow mt-8 md:mt-0">
          <DeletionCard
            provider={provider}
            owner={owner}
            isPersonalSettings={isPersonalSettings}
          />
        </div>
      </div>
    </div>
  )
}

Admin.propTypes = {
  provider: PropTypes.string.isRequired,
  owner: PropTypes.string.isRequired,
}
export default Admin
