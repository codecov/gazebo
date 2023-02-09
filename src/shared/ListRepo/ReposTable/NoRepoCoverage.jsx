import PropTypes from 'prop-types'

import InactiveRepo from './InactiveRepo'

function NoRepoCoverage({
  activated,
  active,
  owner,
  repoName,
  isCurrentUserPartOfOrg,
}) {
  return (
    <span className="text-ds-gray-quinary text-sm">
      {activated ? (
        'No data available'
      ) : (
        <InactiveRepo
          owner={owner}
          repoName={repoName}
          isCurrentUserPartOfOrg={isCurrentUserPartOfOrg}
          isActive={active}
        />
      )}
    </span>
  )
}

NoRepoCoverage.propTypes = {
  owner: PropTypes.string.isRequired,
  repoName: PropTypes.string.isRequired,
  isCurrentUserPartOfOrg: PropTypes.bool.isRequired,
  activated: PropTypes.bool.isRequired,
  active: PropTypes.bool.isRequired,
}

export default NoRepoCoverage
