import PropTypes from 'prop-types'

import config from 'config'

import {
  ErrorCodeEnum,
  UploadStateEnum,
  UploadTypeEnum,
} from 'shared/utils/commit'
import { formatTimeToNow } from 'shared/utils/dates'
import A from 'ui/A'
import Icon from 'ui/Icon'

import RenderError from './RenderError'

const Upload = ({
  ciUrl,
  buildCode = 'build code not found',
  createdAt,
  flags = [],
  downloadUrl,
  errors = [],
  uploadType,
  state,
}) => {
  const isCarriedForward = uploadType === UploadTypeEnum.CARRIED_FORWARD

  return (
    <div className="py-2 px-4 flex flex-col gap-1">
      <div className="flex justify-between ">
        <div className="flex-1 flex gap-1 flex-wrap">
          {ciUrl ? (
            <A href={ciUrl} hook="ci job" isExternal={true}>
              {buildCode}
            </A>
          ) : (
            buildCode
          )}
          <RenderError errors={errors} state={state} />
        </div>
        {createdAt && (
          <span className="text-xs text-ds-gray-quinary">
            {formatTimeToNow(createdAt)}
          </span>
        )}
      </div>
      <div className="flex justify-between">
        <div className="flex gap-2 flex-wrap flex-col md:flex-row">
          {flags.map((flag, i) => (
            <span key={`${flag}-${i}`} className="flex">
              <Icon variant="solid" size="sm" name="flag" />
              <span className="text-xs ml-1">{flag}</span>
            </span>
          ))}
          {isCarriedForward && (
            <span className="text-ds-gray-quinary text-xs">carry-forward</span>
          )}
        </div>
        {downloadUrl && (
          <A
            href={`${config.API_URL}${downloadUrl}`}
            hook="download report"
            download
            isExternal
          >
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
  ]),
  ciUrl: PropTypes.string,
  createdAt: PropTypes.string,
  downloadUrl: PropTypes.string,
  flags: PropTypes.arrayOf(PropTypes.string),
  buildCode: PropTypes.string,
  uploadType: PropTypes.string,
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
