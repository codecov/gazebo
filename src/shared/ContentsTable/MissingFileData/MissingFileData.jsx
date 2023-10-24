import PropTypes from 'prop-types'

function MissingFileData({ isSearching, hasFlagsSelected }) {
  if (isSearching) {
    return <p className="flex flex-1 justify-center">No results found</p>
  }

  if (hasFlagsSelected) {
    return (
      <p className="flex flex-1 justify-center">
        No coverage report uploaded for the selected flags in this branch&apos;s
        head commit
      </p>
    )
  }

  return (
    <p className="flex flex-1 justify-center">
      There was a problem getting repo contents from your provider
    </p>
  )
}

MissingFileData.propTypes = {
  isSearching: PropTypes.bool,
  hasFlagsSelected: PropTypes.bool,
}

export default MissingFileData
