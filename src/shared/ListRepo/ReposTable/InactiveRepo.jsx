import PropTypes from 'prop-types'

import AppLink from 'shared/AppLink'

function InactiveRepo({ owner, repoName, isCurrentUserPartOfOrg, isActive }) {
  if (isActive) return <>Deactivated</>

  return (
    <>
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
    </>
  )
}

InactiveRepo.propTypes = {
  owner: PropTypes.string.isRequired,
  repoName: PropTypes.string,
  isCurrentUserPartOfOrg: PropTypes.bool,
  isActive: PropTypes.bool.isRequired,
}

export default InactiveRepo
