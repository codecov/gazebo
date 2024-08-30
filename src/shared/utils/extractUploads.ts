import countBy from 'lodash/countBy'
import groupBy from 'lodash/groupBy'
import { z } from 'zod'

import {
  UploadErrorCodeEnumSchema,
  UploadStateEnumSchema,
  UploadTypeEnumSchema,
} from 'services/commit'
import { UploadStateEnum, UploadTypeEnum } from 'shared/utils/commit'

interface ErrorObject {
  errorCode: z.infer<typeof UploadErrorCodeEnumSchema> | null
}

export interface Upload {
  id?: number | null
  state?: z.infer<typeof UploadStateEnumSchema>
  provider?: string | null
  createdAt?: string
  updatedAt?: string
  flags?: string[] | null
  jobCode?: string | null
  downloadUrl?: string
  ciUrl?: string | null
  uploadType?: z.infer<typeof UploadTypeEnumSchema>
  buildCode?: string | null
  name?: string | null
  errors: (ErrorObject | null)[]
}

function humanReadableOverview(state: string) {
  if (state === UploadStateEnum.error) return 'errored'
  if (state === UploadStateEnum.processed) return 'successful'
  if (state === UploadStateEnum.complete) return 'carried forward'
  if (state === UploadStateEnum.started) return 'started'
}

function deleteDuplicateCFFUploads({ uploads }: { uploads: Upload[] }) {
  const nonCFFlags = new Set()

  // Get all the flags from "uploaded" uploads
  uploads?.forEach((upload) => {
    if (
      upload?.uploadType !== UploadTypeEnum.CARRIED_FORWARD &&
      upload?.flags
    ) {
      upload.flags.forEach((flag) => nonCFFlags.add(flag))
    }
  })

  // Filter out uploads that have repeated flags, returning those without duplicates
  return uploads.filter(
    (upload) =>
      !(
        upload?.uploadType === UploadTypeEnum.CARRIED_FORWARD &&
        upload?.flags?.some((flag) => nonCFFlags.has(flag))
      )
  )
}

const createUploadOverview = ({ uploads }: { uploads: Upload[] }) =>
  Object.entries(countBy(uploads, (upload) => upload.state))
    .map(([state, count]) => `${count} ${humanReadableOverview(state)}`)
    .join(', ')

const findErroredUploads = ({ uploads }: { uploads: Upload[] }) =>
  groupBy(
    uploads?.filter((upload) => upload.state === UploadStateEnum.error),
    'provider'
  )

export const extractUploads = ({
  unfilteredUploads,
}: {
  unfilteredUploads?: Upload[]
}) => {
  if (!unfilteredUploads) {
    return {
      sortedUploads: {},
      uploadsProviderList: [],
      uploadsOverview: '',
      erroredUploads: [],
      hasNoUploads: true,
    }
  }

  const uploads = deleteDuplicateCFFUploads({ uploads: unfilteredUploads })

  const sortedUploads = groupBy(uploads, 'provider')
  const uploadsProviderList = Object.keys(sortedUploads)
  const hasNoUploads = !uploads || uploads.length === 0
  const uploadsOverview = createUploadOverview({ uploads })
  const erroredUploads = findErroredUploads({ uploads })

  return {
    sortedUploads,
    uploadsProviderList,
    hasNoUploads,
    uploadsOverview,
    erroredUploads,
  }
}
