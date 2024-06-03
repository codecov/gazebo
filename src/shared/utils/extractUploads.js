import countBy from 'lodash/countBy'
import groupBy from 'lodash/groupBy'

import { UploadStateEnum, UploadTypeEnum } from 'shared/utils/commit'

function humanReadableOverview(state, count) {
  if (state === UploadStateEnum.error) return 'errored'
  if (state === UploadStateEnum.processed) return 'successful'
  if (state === UploadStateEnum.complete) return 'carried forward'
  if (state === UploadStateEnum.started) return 'started'
}

function deleteDuplicateCFFUploads({ uploads }) {
  const nonCFFFlags = []
  const duplicateUploads = uploads && [...uploads]

  // Get all the flags from "uploaded" uploads
  duplicateUploads?.forEach((upload) => {
    if (
      upload?.uploadType !== UploadTypeEnum.CARRIED_FORWARD &&
      upload?.flags
    ) {
      nonCFFFlags.push(...upload.flags)
    }
  })

  // Filter out cff uploads with repeated flags
  // We're looping in reverse as splicing reindexes the array, making us
  // skip the index that's removed. Indices are preserved when you
  // loop backwards.
  for (let index = duplicateUploads.length - 1; index >= 0; index--) {
    const upload = duplicateUploads[index]
    if (
      upload?.uploadType === UploadTypeEnum.CARRIED_FORWARD &&
      upload?.flags
    ) {
      for (const flag of upload.flags) {
        if (nonCFFFlags.includes(flag)) {
          duplicateUploads.splice(index, 1)
          break
        }
      }
    }
  }

  return duplicateUploads
}

const createUploadOverview = ({ uploads }) =>
  Object.entries(countBy(uploads, (upload) => upload.state))
    .map(([state, count]) => `${count} ${humanReadableOverview(state, count)}`)
    .join(', ')

const findErroredUploads = ({ uploads }) =>
  groupBy(
    uploads?.filter((upload) => upload.state === UploadStateEnum.error),
    'provider'
  )

export const extractUploads = ({ unfilteredUploads }) => {
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
