import PropTypes from 'prop-types'

import InactiveRepo from '../InactiveRepo'

function NoRepoCoverage({
  activated,
  active,
  owner,
  repoName,
  isCurrentUserPartOfOrg,
}) {
  return (
    <span className="text-sm text-ds-gray-quinary">
      {activated ? (
        'No data'
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
  owner: PropTypes.string,
  repoName: PropTypes.string,
  isCurrentUserPartOfOrg: PropTypes.bool,
  activated: PropTypes.bool,
  active: PropTypes.bool,
}

export default NoRepoCoverage
