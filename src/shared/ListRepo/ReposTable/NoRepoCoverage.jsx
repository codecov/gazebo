import PropTypes from 'prop-types'

import RepoNotSetup from './RepoNotSetup'

function NoRepoCoverage({ active, owner, repoName, isCurrentUserPartOfOrg }) {
  return (
    <span className="text-ds-gray-quinary text-sm">
      {active ? (
        'No data available'
      ) : (
        <RepoNotSetup
          owner={owner}
          repoName={repoName}
          isCurrentUserPartOfOrg={isCurrentUserPartOfOrg}
        />
      )}
    </span>
  )
}

NoRepoCoverage.propTypes = {
  owner: PropTypes.string.isRequired,
  repoName: PropTypes.string.isRequired,
  isCurrentUserPartOfOrg: PropTypes.bool.isRequired,
  active: PropTypes.bool.isRequired,
}

export default NoRepoCoverage
