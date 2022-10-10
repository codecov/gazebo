import PropTypes from 'prop-types'

import A from 'ui/A'

const UploadReference = ({ ciUrl, name, buildCode }) => {
  const uploadRef = name || buildCode

  return ciUrl ? (
    <A href={ciUrl} hook="ci job" isExternal={true}>
      {uploadRef}
    </A>
  ) : (
    uploadRef
  )
}

UploadReference.propTypes = {
  ciUrl: PropTypes.string,
  name: PropTypes.string,
  buildCode: PropTypes.string,
}

export default UploadReference
