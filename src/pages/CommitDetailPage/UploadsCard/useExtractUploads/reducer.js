import countBy from 'lodash/countBy'
import groupBy from 'lodash/groupBy'

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

// eslint-disable-next-line complexity
export function reducer(state, action) {
  const uploads = action?.payload?.uploads

  switch (action.type) {
    case 'setSortedUploads':
      return {
        ...state,
        sortedUploads: groupBy(uploads, 'provider'),
      }
    case 'setUploadsProviderList':
      return {
        ...state,
        uploadsProviderList: Object.keys(state?.sortedUploads),
      }
    case 'setUploadsOverview':
      const countedStates = countBy(uploads, (upload) => upload.state)
      const errorCount = Object.entries(countedStates)
        .map(
          ([state, count]) => `${count} ${humanReadableOverview(state, count)}`
        )
        .join(', ')
      return {
        ...state,
        uploadsOverview: errorCount,
      }
    case 'setErroredUploads':
      const errorList = uploads?.filter(
        (upload) => upload.state === UploadStateEnum.error
      )
      return {
        ...state,
        erroredUploads: groupBy(errorList, 'provider'),
      }
    case 'setHasNoUploads':
      return {
        ...state,
        hasNoUploads: !uploads || uploads.length === 0,
      }
    default:
      return state
  }
}
