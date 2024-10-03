import { z } from 'zod'

import { UploadFilters } from 'pages/CommitDetailPage/CommitCoverage/UploadsCard/UploadsCard'
import {
  UploadErrorCodeEnumSchema,
  UploadStateEnumSchema,
  UploadTypeEnumSchema,
} from 'services/commit'
import { UploadStateEnum, UploadTypeEnum } from 'shared/utils/commit'

export interface UploadErrorObject {
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
  errors: (UploadErrorObject | null)[]
}

export const NONE = 'none'

function humanReadableOverview(
  state: (typeof UploadStateEnum)[keyof typeof UploadStateEnum]
) {
  switch (state) {
    case UploadStateEnum.error:
      return 'errored'
    case UploadStateEnum.uploaded:
      return 'uploaded'
    case UploadStateEnum.processed:
      return 'successful'
    case UploadStateEnum.complete:
      return 'carried forward'
    case UploadStateEnum.started:
      return 'started'
  }
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
  return uploads.filter(
    (upload) =>
      !(
        upload?.uploadType === UploadTypeEnum.CARRIED_FORWARD &&
        upload?.flags?.some((flag) => nonCFFlags.has(flag))
      )
  )
}

const createUploadGroups = ({
  uploads,
  filters,
}: {
  uploads: Upload[]
  filters: UploadFilters
}) => {
  const stateCounts: Record<string, number> = {}
  const providerGroups: Record<string, Upload[]> = {}
  const errorProviderGroups: Record<string, Upload[]> = {}
  const flagErrorUploads: Record<string, Upload[]> = {}
  const filteredUploads: Upload[] = []

  uploads.forEach((upload) => {
    // Count the occurrences of each state
    if (upload.state) {
      stateCounts[upload.state] = (stateCounts[upload.state] || 0) + 1
    }

    if (upload.provider == null) {
      upload.provider = NONE
    }

    if (upload.state === UploadStateEnum.error) {
      if (!errorProviderGroups[upload.provider]) {
        errorProviderGroups[upload.provider] = [upload]
      } else {
        errorProviderGroups[upload.provider]!.unshift(upload)
      }
    }

    if (upload.flags?.length && upload.flags.length > 1) {
      if (!flagErrorUploads[upload.provider]) {
        flagErrorUploads[upload.provider] = [upload]
      } else {
        flagErrorUploads[upload.provider]!.unshift(upload)
      }
    }

    if (
      (!filters.flagErrors && !filters.uploadErrors) ||
      (filters.flagErrors &&
        upload.flags?.length != null &&
        upload.flags.length >= 2) ||
      (filters.uploadErrors && upload.state === UploadStateEnum.error)
    ) {
      filteredUploads.unshift(upload)

      if (!providerGroups[upload.provider]) {
        providerGroups[upload.provider] = [upload]
      } else {
        providerGroups[upload.provider]!.unshift(upload)
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
    flagErrorUploads,
    searchResults: searchUploads({
      uploads: filteredUploads,
      search: filters.searchTerm,
    }).reverse(),
  }
}

function searchUploads({
  uploads,
  search,
}: {
  uploads: Upload[]
  search: string
}): Upload[] {
  if (search === '') {
    return []
  }

  const getSearchScore = (upload: Upload) => {
    // Add 1 point for each match of `search` in name, jobCode, flags, and provider.
    let score = 0
    score += upload.name?.match(search)?.length ?? 0
    score += upload.jobCode?.match(search)?.length ?? 0
    upload.flags?.forEach((flag) => (score += flag.match(search)?.length ?? 0))
    score += upload.provider?.match(search)?.length ?? 0
    return score
  }

  return uploads
    .filter((upload) => getSearchScore(upload) > 0)
    .sort((a: Upload, b: Upload) => {
      return getSearchScore(a) - getSearchScore(b)
    })
}

export const extractUploads = ({
  unfilteredUploads,
  filters = { flagErrors: false, uploadErrors: false, searchTerm: '' },
}: {
  unfilteredUploads?: Upload[]
  filters?: UploadFilters
}) => {
  if (!unfilteredUploads) {
    return {
      groupedUploads: {} as Record<string, Upload[]>,
      uploadsProviderList: [],
      uploadsOverview: '',
      erroredUploads: {} as Record<string, Upload[]>,
      flagErrorUploads: {} as Record<string, Upload[]>,
      hasNoUploads: true,
    }
  }

  const uploads = deleteDuplicateCFFUploads({ uploads: unfilteredUploads })
  const hasNoUploads = !uploads || uploads.length === 0

  const {
    uploadsOverview,
    providerGroups: groupedUploads,
    errorProviderGroups: erroredUploads,
    flagErrorUploads,
    searchResults,
  } = createUploadGroups({ uploads, filters })

  const uploadsProviderList = Object.keys(groupedUploads)

  return {
    groupedUploads,
    uploadsProviderList,
    hasNoUploads,
    uploadsOverview,
    erroredUploads,
    flagErrorUploads,
    searchResults,
  }
}
