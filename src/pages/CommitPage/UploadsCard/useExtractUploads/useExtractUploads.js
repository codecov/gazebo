import countBy from 'lodash/countBy'
import groupBy from 'lodash/groupBy'
import { useEffect, useState } from 'react'

import { UploadStateEnum, UploadTypeEnum } from 'shared/utils/commit'

// eslint-disable-next-line complexity
function humanReadableOverview(state, count) {
  const plural = (count) => (count > 1 ? 'are' : 'is')
  if (state === UploadStateEnum.error) return 'errored'
  if (state === UploadStateEnum.uploaded || state === UploadStateEnum.pending)
    return `${plural(count)} pending`
  if (state === UploadStateEnum.processed) return 'successful'
  if (state === UploadStateEnum.complete) return 'carried forward'
  if (state === UploadStateEnum.started) return 'started'
}

function deleteDuplicateCFFUploads({ uploads }) {
  let nonCFFFlags = []

  // Get all the non cff flags
  uploads?.forEach((upload) => {
    if (
      upload?.uploadType !== UploadTypeEnum.CARRIED_FORWARD &&
      upload?.flags
    ) {
      nonCFFFlags.push(...upload.flags)
    }
  })

  // Filter out cff uploads with repeated flags
  uploads?.forEach((upload) => {
    if (
      upload?.uploadType === UploadTypeEnum.CARRIED_FORWARD &&
      upload?.flags
    ) {
      upload.flags.forEach((flag) => {
        if (nonCFFFlags.includes(flag)) {
          uploads.pop()
        }
      })
    }
  })

  return uploads
}

// eslint-disable-next-line max-statements
export function useExtractUploads({ uploads }) {
  const [sortedUploads, setSortedUploads] = useState({})
  const [uploadsProviderList, setUploadsProviderList] = useState([])
  const [erroredUploads, setErroredUploads] = useState([])
  const [uploadsOverview, setUploadsOverview] = useState('')
  const hasNoUploads = !uploads || uploads.length === 0

  uploads = deleteDuplicateCFFUploads({ uploads })

  // Sorted Uploads
  useEffect(() => {
    setSortedUploads(groupBy(uploads, 'provider'))
  }, [uploads])

  // Uploads Providers
  useEffect(() => {
    setUploadsProviderList(Object.keys(sortedUploads))
  }, [uploads, sortedUploads])

  // Uploads Overview Summary
  useEffect(() => {
    const countedStates = countBy(uploads, (upload) => upload.state)
    const errorCount = Object.entries(countedStates)
      .map(
        ([state, count]) => `${count} ${humanReadableOverview(state, count)}`
      )
      .join(', ')
    setUploadsOverview(errorCount)
  }, [uploads, uploadsProviderList])

  // Uploads Errors Per Provider
  useEffect(() => {
    const errorList = uploads?.filter(
      (upload) => upload.state === UploadStateEnum.error
    )
    setErroredUploads(groupBy(errorList, 'provider'))
  }, [uploads])

  return {
    uploadsOverview,
    sortedUploads,
    uploadsProviderList,
    hasNoUploads,
    erroredUploads,
  }
}
