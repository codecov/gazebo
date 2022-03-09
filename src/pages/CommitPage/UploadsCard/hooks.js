import countBy from 'lodash/countBy'
import groupBy from 'lodash/groupBy'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import { useCommit } from 'services/commit'
import { UploadStateEnum } from 'shared/utils/commit'

function humanReadableOverview(state, count) {
  const plural = (count) => (count > 1 ? 'are' : 'is')
  if (state === UploadStateEnum.error) return 'errored'
  if (state === UploadStateEnum.uploaded) return `${plural(count)} pending`
  if (state === UploadStateEnum.processed) return 'successful'
}

export function useUploads() {
  const { provider, owner, repo, commit } = useParams()
  const [sortedUploads, setSortedUploads] = useState({})
  const [uploadsProviderList, setUploadsProviderList] = useState([])
  const [uploadsOverview, setUploadsOverview] = useState('')
  const { data } = useCommit({
    provider,
    owner,
    repo,
    commitid: commit,
  })

  const uploads = data?.commit?.uploads

  useEffect(() => {
    setSortedUploads(groupBy(uploads, 'provider'))
  }, [uploads])

  useEffect(() => {
    setUploadsProviderList(Object.keys(sortedUploads))
  }, [uploads, sortedUploads])

  useEffect(() => {
    const countedStates = countBy(uploads, (upload) => upload.state)
    const string = Object.entries(countedStates)
      .map(
        ([state, count]) => `${count} ${humanReadableOverview(state, count)}`
      )
      .join(', ')
    setUploadsOverview(string)
  }, [uploads, uploadsProviderList])

  return {
    uploadsOverview,
    sortedUploads,
    uploadsProviderList,
    hasNoUploads: !uploads || uploads.length === 0,
  }
}
