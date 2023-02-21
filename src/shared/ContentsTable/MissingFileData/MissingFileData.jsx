import PropTypes from 'prop-types'

function MissingFileData({ isSearching }) {
  if (isSearching) {
    return <p className="flex flex-1 justify-center">No results found</p>
  }

  return (
    <p className="flex flex-1 justify-center">
      There was a problem getting repo contents from your provider
    </p>
  )
}

MissingFileData.propTypes = {
  isSearching: PropTypes.bool,
}

export default MissingFileData
