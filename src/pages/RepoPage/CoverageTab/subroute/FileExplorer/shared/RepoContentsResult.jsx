import PropType from 'prop-types'

import MissingFileData from 'shared/ContentsTable/MissingFileData'

function RepoContentsResult({ isSearching, isMissingHeadReport }) {
  if (isMissingHeadReport) {
    return (
      <p className="flex flex-1 justify-center">
        No coverage report uploaded for this branch head commit
      </p>
    )
  }

  return <MissingFileData isSearching={isSearching} />
}

RepoContentsResult.propTypes = {
  isSearching: PropType.bool,
  isMissingHeadReport: PropType.bool,
}

export default RepoContentsResult
