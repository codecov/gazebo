import PropTypes from 'prop-types'

import AppLink from 'shared/AppLink'

function InactiveRepo({ owner, repoName, isCurrentUserPartOfOrg, isActive }) {
  if (isActive) return <>Deactivated</>

  return (
    <div className="whitespace-nowrap">
      Not yet enabled{' '}
      {isCurrentUserPartOfOrg && (
        <AppLink
          className="text-ds-blue font-semibold"
          pageName="new"
          options={{
            owner,
            repo: repoName,
          }}
        >
          setup repo
        </AppLink>
      )}
    </div>
  )
}

InactiveRepo.propTypes = {
  owner: PropTypes.string.isRequired,
  repoName: PropTypes.string,
  isCurrentUserPartOfOrg: PropTypes.bool,
  isActive: PropTypes.bool.isRequired,
}

export default InactiveRepo
