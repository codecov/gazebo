import PropTypes from 'prop-types'

import {
  ErrorCodeEnum,
  UploadStateEnum,
  UploadTypeEnum,
} from 'shared/utils/commit'
import { formatTimeToNow } from 'shared/utils/dates'
import A from 'ui/A'
import Icon from 'ui/Icon'

import RenderError from './RenderError'
import UploadReference from './UploadReference'

const Upload = ({
  ciUrl,
  buildCode = 'build code not found',
  createdAt,
  flags = [],
  downloadUrl,
  errors = [],
  uploadType,
  state,
  name,
}) => {
  const isCarriedForward = uploadType === UploadTypeEnum.CARRIED_FORWARD

  return (
    <div className="flex flex-col gap-1 border-r border-ds-gray-secondary px-4 py-2">
      <div className="flex justify-between ">
        <div className="flex flex-1 flex-wrap gap-1">
          <UploadReference ciUrl={ciUrl} name={name} buildCode={buildCode} />
          <RenderError errors={errors} state={state} />
        </div>
        {createdAt && (
          <span className="text-xs text-ds-gray-quinary">
            {formatTimeToNow(createdAt)}
          </span>
        )}
      </div>
      <div className="flex justify-between">
        <div className="flex flex-col flex-wrap gap-2 md:flex-row">
          {flags.map((flag, i) => (
            <span key={`${flag}-${i}`} className="flex">
              <Icon variant="solid" size="sm" name="flag" />
              <span className="ml-1 text-xs">{flag}</span>
            </span>
          ))}
          {isCarriedForward && (
            <span className="text-xs text-ds-gray-quinary">carry-forward</span>
          )}
        </div>
        {downloadUrl && (
          <A href={downloadUrl} hook="download report" download isExternal>
            Download
          </A>
        )}
      </div>
    </div>
  )
}

Upload.propTypes = {
  state: PropTypes.oneOf([
    UploadStateEnum.error,
    UploadStateEnum.uploaded,
    UploadStateEnum.processed,
    UploadStateEnum.complete,
  ]),
  ciUrl: PropTypes.string,
  createdAt: PropTypes.string,
  downloadUrl: PropTypes.string,
  flags: PropTypes.arrayOf(PropTypes.string),
  buildCode: PropTypes.string,
  uploadType: PropTypes.string,
  name: PropTypes.string,
  errors: PropTypes.arrayOf(
    PropTypes.shape({
      errorCode: PropTypes.oneOf([
        ErrorCodeEnum.fileNotFoundInStorage,
        ErrorCodeEnum.reportEmpty,
        ErrorCodeEnum.reportExpired,
      ]),
    })
  ),
}

export default Upload
