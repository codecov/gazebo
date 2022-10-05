import countBy from 'lodash/countBy'
import groupBy from 'lodash/groupBy'
import { useEffect, useState } from 'react'

import { UploadStateEnum } from 'shared/utils/commit'

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

export function useExtractUploads({ uploads }) {
  const [sortedUploads, setSortedUploads] = useState({})
  const [uploadsProviderList, setUploadsProviderList] = useState([])
  const [erroredUploads, setErroredUploads] = useState([])
  const [uploadsOverview, setUploadsOverview] = useState('')
  const hasNoUploads = !uploads || uploads.length === 0

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
