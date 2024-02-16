import PropTypes from 'prop-types'

import AppLink from 'shared/AppLink'

function InactiveRepo({ owner, repoName, isCurrentUserPartOfOrg, isActive }) {
  if (isActive) return <>Deactivated</>
  if (!isCurrentUserPartOfOrg) return <>Inactive</>

  return (
    <AppLink
      className="flex items-center rounded bg-ds-blue px-4 py-1 font-semibold text-gray-100"
      pageName="new"
      options={{
        owner,
        repo: repoName,
      }}
    >
      Configure
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
