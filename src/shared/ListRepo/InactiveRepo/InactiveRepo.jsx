import PropTypes from 'prop-types'

import AppLink from 'shared/AppLink'
import Icon from 'ui/Icon'

function InactiveRepo({ owner, repoName, isCurrentUserPartOfOrg, isActive }) {
  if (isActive) return <>Deactivated</>
  if (!isCurrentUserPartOfOrg) return <>Inactive</>

  return (
    <AppLink
      className="flex items-center font-semibold text-ds-blue"
      pageName="new"
      options={{
        owner,
        repo: repoName,
      }}
    >
      Setup repo
      <Icon name="chevronRight" variant="solid" size="sm" />
    </AppLink>
  )
}

InactiveRepo.propTypes = {
  owner: PropTypes.string.isRequired,
  repoName: PropTypes.string,
  isCurrentUserPartOfOrg: PropTypes.bool,
  isActive: PropTypes.bool.isRequired,
}

export default InactiveRepo
