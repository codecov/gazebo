import { useEffect, useReducer } from 'react'

import { UploadTypeEnum } from 'shared/utils/commit'

import { reducer } from './reducer'

function deleteDuplicateCFFUploads({ uploads }) {
  const nonCFFFlags = []
  const duplicateUploads = uploads && [...uploads]

  // Get all the non cff flags
  duplicateUploads?.forEach((upload) => {
    if (
      upload?.uploadType !== UploadTypeEnum.CARRIED_FORWARD &&
      upload?.flags
    ) {
      nonCFFFlags.push(...upload.flags)
    }
  })

  // Filter out cff uploads with repeated flags
  duplicateUploads?.forEach((upload, index) => {
    if (
      upload?.uploadType === UploadTypeEnum.CARRIED_FORWARD &&
      upload?.flags
    ) {
      upload.flags.forEach((flag) => {
        if (nonCFFFlags.includes(flag)) {
          duplicateUploads.splice(index, 1)
        }
      })
    }
  })

  return duplicateUploads
}

export function useExtractUploads({ uploads: unfilteredUploads }) {
  const [state, dispatch] = useReducer(reducer, {
    sortedUploads: {},
    uploadsProviderList: [],
    uploadsOverview: '',
    erroredUploads: [],
    hasNoUploads: true,
  })

  // Sorted Uploads
  useEffect(() => {
    const uploads = deleteDuplicateCFFUploads({
      uploads: unfilteredUploads,
    })
    dispatch({ type: 'setSortedUploads', payload: { uploads } })
    dispatch({ type: 'setHasNoUploads', payload: { uploads } })
  }, [unfilteredUploads])

  // Uploads Providers
  useEffect(() => {
    dispatch({ type: 'setUploadsProviderList' })
  }, [unfilteredUploads, state?.sortedUploads])

  // Uploads Overview Summary
  useEffect(() => {
    const uploads = deleteDuplicateCFFUploads({
      uploads: unfilteredUploads,
    })
    dispatch({ type: 'setUploadsOverview', payload: { uploads } })
  }, [unfilteredUploads, state?.uploadsProviderList])

  // Uploads Errors Per Provider
  useEffect(() => {
    const uploads = deleteDuplicateCFFUploads({
      uploads: unfilteredUploads,
    })
    dispatch({ type: 'setErroredUploads', payload: { uploads } })
  }, [unfilteredUploads])

  return {
    ...state,
  }
}
