import { z } from 'zod'

import { UploadFilters } from 'pages/CommitDetailPage/CommitCoverage/UploadsCard/UploadsCard'
import {
  UploadErrorCodeEnumSchema,
  UploadStateEnumSchema,
  UploadTypeEnumSchema,
} from 'services/commit'
import {
  UploadErrorStates,
  UploadStateEnum,
  UploadTypeEnum,
} from 'shared/utils/commit'

export interface UploadErrorObject {
  errorCode: z.infer<typeof UploadErrorCodeEnumSchema> | null
}

export interface Upload {
  id: number | null
  state: z.infer<typeof UploadStateEnumSchema>
  provider: string | null
  createdAt: string
  updatedAt: string
  flags: string[] | null | undefined
  jobCode: string | null
  downloadUrl: string
  ciUrl: string | null
  uploadType: z.infer<typeof UploadTypeEnumSchema>
  buildCode: string | null
  name: string | null
  errors: (UploadErrorObject | null)[]
}

export const NONE = 'none'

function humanReadableOverview(state: (typeof UploadErrorStates)[number]) {
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

type StateCounts = {
  [Property in (typeof UploadErrorStates)[number]]?: number
}

const createUploadGroups = ({
  uploads,
  filters,
}: {
  uploads: Upload[]
  filters: UploadFilters
}) => {
  const stateCounts: StateCounts = {}
  const providerGroups: Record<string, Upload[]> = {}
  const errorProviderGroups: Record<string, Upload[]> = {}
  const flagErrorUploads: Record<string, Upload[]> = {}
  const filteredUploads: Upload[] = []

  uploads.forEach((upload) => {
    // Count the occurrences of each state
    stateCounts[upload.state] = (stateCounts[upload.state] || 0) + 1

    if (upload.provider === null) {
      upload.provider = NONE
    }

    if (upload.state === UploadStateEnum.error) {
      const errorProviderGroup = errorProviderGroups[upload.provider]
      if (errorProviderGroup) {
        errorProviderGroup.unshift(upload)
      } else {
        errorProviderGroups[upload.provider] = [upload]
      }
    }

    if (upload.flags?.length && upload.flags.length > 1) {
      const flagErrorUploadGroup = flagErrorUploads[upload.provider]
      if (flagErrorUploadGroup) {
        flagErrorUploadGroup.unshift(upload)
      } else {
        flagErrorUploads[upload.provider] = [upload]
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

      const providerGroup = providerGroups[upload.provider]
      if (providerGroup) {
        providerGroup.unshift(upload)
      } else {
        providerGroups[upload.provider] = [upload]
      }
    }
  })

  const uploadsOverview = UploadErrorStates.reduce((acc, state) => {
    const count = stateCounts[state]
    if (count) {
      return `${acc}, ${count} ${humanReadableOverview(state)}`
    }
    return acc
  }, '').slice(2)

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
