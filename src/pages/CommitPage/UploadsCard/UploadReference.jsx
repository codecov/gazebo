import PropTypes from 'prop-types'

import A from 'ui/A'

const UploadReference = ({ ciUrl, name, buildCode }) => {
  const uploadRef = name || buildCode

  if (ciUrl) {
    return (
      <A href={ciUrl} hook="ci job" isExternal={true}>
        {uploadRef}
      </A>
    )
  }
  return <p>{uploadRef}</p>
}

UploadReference.propTypes = {
  ciUrl: PropTypes.string,
  name: PropTypes.string,
  buildCode: PropTypes.string,
}

export default UploadReference
