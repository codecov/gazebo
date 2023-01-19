import PropTypes from 'prop-types'

import AppLink from 'shared/AppLink'

function RepoNotSetup({ owner, repoName, isCurrentUserPartOfOrg }) {
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

RepoNotSetup.propTypes = {
  owner: PropTypes.string.isRequired,
  repoName: PropTypes.string,
  isCurrentUserPartOfOrg: PropTypes.bool,
}

export default RepoNotSetup
