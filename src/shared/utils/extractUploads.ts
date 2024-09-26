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

export const NONE = 'none'

function humanReadableOverview(state: string) {
  if (state === UploadStateEnum.error) return 'errored'
  if (state === UploadStateEnum.processed) return 'successful'
  if (state === UploadStateEnum.complete) return 'carried forward'
  if (state === UploadStateEnum.started) return 'started'
}

export function deleteDuplicateCFFUploads({ uploads }: { uploads: Upload[] }) {
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
  let result = []

  for (let upload of uploads) {
    if (upload.uploadType !== UploadTypeEnum.CARRIED_FORWARD || !upload.flags) {
      result.push(upload)
    } else {
      for (let flag of upload.flags) {
        if (nonCFFlags.has(flag)) {
          break
        }
      }
      result.push(upload)
    }
  }

  return result

  // return uploads.filter(
  //   (upload) =>
  //     !(
  //       upload?.uploadType === UploadTypeEnum.CARRIED_FORWARD &&
  //       upload?.flags?.some((flag) => nonCFFlags.has(flag))
  //     )
  // )
}

const createUploadGroups = ({ uploads }: { uploads: Upload[] }) => {
  const stateCounts: Record<string, number> = {}
  const providerGroups: Record<string, Upload[]> = {}
  const errorProviderGroups: Record<string, Upload[]> = {}

  uploads.forEach((upload) => {
    // Count the occurrences of each state
    if (upload.state) {
      stateCounts[upload.state] = (stateCounts[upload.state] || 0) + 1
    }

    const provider =
      upload.provider === null || upload.provider === undefined
        ? NONE
        : upload.provider

    if (!providerGroups[provider]) {
      providerGroups[provider] = [upload]
    } else {
      providerGroups[provider]!.push(upload)
    }

    if (upload.state === UploadStateEnum.error) {
      if (!errorProviderGroups[provider]) {
        errorProviderGroups[provider] = [upload]
      } else {
        errorProviderGroups[provider]!.push(upload)
      }
    }
  })

  const uploadsOverview = Object.entries(stateCounts)
    .map(([state, count]) => `${count} ${humanReadableOverview(state)}`)
    .join(', ')

  return {
    uploadsOverview,
    providerGroups,
    errorProviderGroups,
  }
}

export const extractUploads = ({
  unfilteredUploads,
}: {
  unfilteredUploads?: Upload[]
}) => {
  if (!unfilteredUploads) {
    return {
      groupedUploads: {},
      uploadsProviderList: [],
      uploadsOverview: '',
      erroredUploads: [],
      hasNoUploads: true,
    }
  }

  const uploads = deleteDuplicateCFFUploads({ uploads: unfilteredUploads })
  const hasNoUploads = uploads.length === 0

  const {
    uploadsOverview,
    providerGroups: groupedUploads,
    errorProviderGroups: erroredUploads,
  } = createUploadGroups({ uploads })

  const uploadsProviderList = Object.keys(groupedUploads)

  return {
    groupedUploads,
    uploadsProviderList,
    hasNoUploads,
    uploadsOverview,
    erroredUploads,
  }
}
