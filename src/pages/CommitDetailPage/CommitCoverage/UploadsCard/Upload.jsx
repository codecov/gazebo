import { useQueryClient } from '@tanstack/react-query'
import without from 'lodash/without'
import PropTypes from 'prop-types'
import { useState } from 'react'

import {
  ErrorCodeEnum,
  UploadStateEnum,
  UploadTypeEnum,
} from 'shared/utils/commit'
import { formatTimeToNow } from 'shared/utils/dates'
import A from 'ui/A'
import Checkbox from 'ui/Checkbox'
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
  id,
}) => {
  const [checked, setChecked] = useState(true)
  const queryClient = useQueryClient()
  const isCarriedForward = uploadType === UploadTypeEnum.CARRIED_FORWARD

  return (
    <div className="flex flex-col gap-1 border-r border-ds-gray-secondary px-4 py-2">
      <div className="flex justify-between ">
        <div className="flex flex-1 flex-wrap items-center">
          <Checkbox
            checked={checked}
            dataMarketing="toggle-upload-hit-count"
            onClick={() => {
              if (checked) {
                // User is unchecking
                queryClient.setQueryData(['IgnoredUploadIds'], (oldData) => [
                  ...(oldData ?? []),
                  id,
                ])
              } else {
                queryClient.setQueryData(['IgnoredUploadIds'], (oldData) =>
                  without(oldData, id)
                )
              }

              setChecked(!checked)
            }}
          />

          <UploadReference ciUrl={ciUrl} name={name} buildCode={buildCode} />
        </div>
        {createdAt && (
          <span className="text-xs text-ds-gray-quinary">
            {formatTimeToNow(createdAt)}
          </span>
        )}
      </div>
      <div className="flex justify-between pl-5">
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
      <RenderError errors={errors} state={state} />
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
  id: PropTypes.number,
  setIgnoredIds: PropTypes.func,
}

export default Upload
