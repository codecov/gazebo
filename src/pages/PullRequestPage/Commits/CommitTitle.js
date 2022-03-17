import PropType from 'prop-types'

function CommitTitle({ hasHeadCoverage, hasPatchCoverage, hasChangeCoverage }) {
  return (
    <>
      Commits
      {hasHeadCoverage && (
        <p className="text-ds-gray-quinary text-xs font-normal uppercase">
          Head %
        </p>
      )}
      {hasPatchCoverage && (
        <p className="text-ds-gray-quinary text-xs font-normal">Patch %</p>
      )}
      {hasChangeCoverage && (
        <p className="text-ds-gray-quinary text-xs font-normal">+/-</p>
      )}
    </>
  )
}

CommitTitle.propTypes = {
  hasHeadCoverage: PropType.bool,
  hasPatchCoverage: PropType.bool,
  hasChangeCoverage: PropType.bool,
}

export default CommitTitle
