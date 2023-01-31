import PropTypes from 'prop-types'

function MissingFileData({ isSearching }) {
  if (isSearching) {
    return <p className="flex justify-center flex-1">No results found</p>
  }

  return (
    <p className="flex justify-center flex-1">
      There was a problem getting repo contents from your provider
    </p>
  )
}

MissingFileData.propTypes = {
  isSearching: PropTypes.bool,
}

export default MissingFileData
