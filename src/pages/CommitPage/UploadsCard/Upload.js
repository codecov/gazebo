import formatDistanceToNow from 'date-fns/formatDistanceToNow'
import PropTypes from 'prop-types'

import config from 'config'
import { ErrorCodeEnum } from 'shared/utils/commit'

import Icon from 'ui/Icon'
import A from 'ui/A'

function humanReadableError(errorCode) {
  if (errorCode === ErrorCodeEnum.fileNotFoundInStorage)
    return 'processing failed'
  if (errorCode === ErrorCodeEnum.reportExpired) return 'upload expired'
  if (errorCode === ErrorCodeEnum.reportEmpty) return 'upload is empty'
}

const Upload = ({
  ciUrl,
  buildCode = 'build code not found',
  createdAt,
  flags = [],
  downloadUrl,
  errors = [],
}) => (
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
        {errors.map(({ errorCode, i }) => (
          <span
            key={`errorCode-${errorCode}-${i}`}
            className="flex gap-1 items-center text-ds-primary-red"
          >
            <Icon size="sm" name="exclamation" variant="solid" />
            {humanReadableError(errorCode)}
          </span>
        ))}
      </div>
      {createdAt && (
        <span className="text-xs text-ds-gray-quinary">
          {formatDistanceToNow(new Date(createdAt), {
            addSuffix: true,
          })}
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

Upload.propTypes = {
  ciUrl: PropTypes.string,
  createdAt: PropTypes.string,
  downloadUrl: PropTypes.string,
  flags: PropTypes.arrayOf(PropTypes.string),
  buildCode: PropTypes.string,
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
