import { useQueryClient } from '@tanstack/react-query'
import without from 'lodash/without'
import { useState } from 'react'

import { UploadTypeEnum } from 'shared/utils/commit'
import { formatTimeToNow } from 'shared/utils/dates'
import { Upload } from 'shared/utils/extractUploads'
import A from 'ui/A'
import Checkbox from 'ui/Checkbox'
import Icon from 'ui/Icon'

import RenderError from './RenderError'
import UploadReference from './UploadReference'

interface UploadProps {
  upload: Upload
}

const UploadItem = ({
  upload: {
    ciUrl,
    buildCode,
    createdAt,
    flags,
    downloadUrl,
    errors,
    uploadType,
    state,
    name,
    id,
  },
}: UploadProps) => {
  const [checked, setChecked] = useState(true)
  const queryClient = useQueryClient()
  const isCarriedForward = uploadType === UploadTypeEnum.CARRIED_FORWARD

  return (
    <div className="flex flex-col gap-1 border-r border-ds-gray-secondary px-4 py-2">
      <div className="flex justify-between ">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <Checkbox
            checked={checked}
            data-marketing="toggle-upload-hit-count"
            onClick={() => {
              if (checked && id != null) {
                // User is unchecking
                queryClient.setQueryData(
                  ['IgnoredUploadIds'],
                  (oldData?: number[]) => [...(oldData ?? []), id]
                )
              } else if (id != null) {
                queryClient.setQueryData(
                  ['IgnoredUploadIds'],
                  (oldData?: number[]) => without(oldData, id)
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
          {flags
            ? flags.map((flag, i) => (
                <span key={`${flag}-${i}`} className="flex">
                  <Icon variant="solid" size="sm" name="flag" />
                  <span className="ml-1 text-xs">{flag}</span>
                </span>
              ))
            : null}
          {isCarriedForward && (
            <span className="text-xs text-ds-gray-quinary">carry-forward</span>
          )}
        </div>
        {/* @ts-expect-error */}
        <A href={downloadUrl} hook="download report" download isExternal>
          Download
        </A>
      </div>
      <RenderError errors={errors} state={state} flags={flags} />
    </div>
  )
}

export default UploadItem
