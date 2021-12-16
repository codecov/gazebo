import PropTypes from 'prop-types'

import Upload from './Upload'

const UploadGroup = ({ title, uploads = [] }) => (
  <>
    <span className="text-sm font-semibold flex-1 py-1 px-4">{title}</span>
    {uploads.map(
      (
        { ciUrl, buildCode, createdAt, flags = [], downloadUrl, errors = [] },
        i
      ) => (
        <Upload
          ciUrl={ciUrl}
          buildCode={buildCode}
          createdAt={createdAt}
          flags={flags}
          downloadUrl={downloadUrl}
          errors={errors}
          key={i}
        />
      )
    )}
  </>
)

UploadGroup.propTypes = {
  uploads: PropTypes.arrayOf(
    PropTypes.shape({
      state: PropTypes.string,
      provider: PropTypes.string,
      ciUrl: PropTypes.string,
      createdAt: PropTypes.string,
      downloadUrl: PropTypes.string,
      flags: PropTypes.arrayOf(PropTypes.string),
      uploadType: PropTypes.string,
      updatedAt: PropTypes.string,
      jobCode: PropTypes.string,
      errors: PropTypes.arrayOf(
        PropTypes.shape({ errorCode: PropTypes.string })
      ),
    })
  ),
  title: PropTypes.string,
}

export default UploadGroup
