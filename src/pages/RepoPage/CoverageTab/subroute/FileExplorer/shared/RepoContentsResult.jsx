import PropType from 'prop-types'

import MissingFileData from 'shared/ContentsTable/MissingFileData'

function RepoContentsResult({
  isSearching,
  isMissingHeadReport,
  hasFlagsSelected,
}) {
  if (isMissingHeadReport) {
    return (
      <p className="flex flex-1 justify-center">
        No coverage report uploaded for this branch head commit
      </p>
    )
  }

  if (hasFlagsSelected) {
    return (
      <p className="flex flex-1 justify-center">
        No coverage report uploaded for the selected flags in this branch&apos;s
        head commit
      </p>
    )
  }

  return <MissingFileData isSearching={isSearching} />
}

RepoContentsResult.propTypes = {
  isSearching: PropType.bool,
  isMissingHeadReport: PropType.bool,
  hasFlagsSelected: PropType.bool,
}

export default RepoContentsResult
