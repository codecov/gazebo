import PropTypes from 'prop-types'

import AppLink from 'shared/AppLink'

function RepoNotSetup({ owner, repoName, isCurrentUserPartOfOrg }) {
  return (
    <span className="flex w-full justify-end gap-1">
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
    </span>
  )
}

RepoNotSetup.propTypes = {
  owner: PropTypes.string.isRequired,
  repoName: PropTypes.string,
  isCurrentUserPartOfOrg: PropTypes.bool,
}

export default RepoNotSetup
