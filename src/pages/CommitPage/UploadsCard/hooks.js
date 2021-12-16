import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import groupBy from 'lodash/groupBy'
import countBy from 'lodash/countBy'

import { useCommit } from 'services/commit'
import { CommitStateEnum } from 'shared/utils/commit'

function humanReadableOverview(state, count) {
  const plural = (count) => (count > 1 ? 'are' : 'is')
  if (state === CommitStateEnum.error) return 'errored'
  if (state === CommitStateEnum.uploaded) return `${plural(count)} pending`
  if (state === CommitStateEnum.processed) return 'successful'
}

export function useUploads() {
  const { provider, owner, repo, commit } = useParams()
  const {
    data: {
      commit: { uploads },
    },
  } = useCommit({
    provider,
    owner,
    repo,
    commitid: commit,
  })

  const [sortedUploads, setSortedUploads] = useState([])
  const [uploadProviderList, setUploadProviderList] = useState([])
  const [uploadOverview, setUploadOverview] = useState('')

  useEffect(() => {
    setSortedUploads(groupBy(uploads, 'provider'))
  }, [uploads])

  useEffect(() => {
    setUploadProviderList(Object.keys(sortedUploads))
  }, [uploads, sortedUploads])

  useEffect(() => {
    const countedStates = countBy(uploads, (upload) => upload.state)
    const string = Object.entries(countedStates)
      .map(
        ([state, count]) => `${count} ${humanReadableOverview(state, count)}`
      )
      .join(', ')
    setUploadOverview(string)
  }, [uploads, uploadProviderList])

  return {
    uploadOverview,
    sortedUploads,
    uploadProviderList,
    hasNoUploads: !uploads || uploads.length === 0,
  }
}
