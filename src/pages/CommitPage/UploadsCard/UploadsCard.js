import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import groupBy from 'lodash/groupBy'
import countBy from 'lodash/countBy'

import { useCommit } from 'services/commit'

import A from 'ui/A'

import YamlModal from '../YamlModal'
import UploadGroup from './UploadGroup'

function humanReadableOverview(state, count) {
  const plural = (count) => (count > 1 ? 'are' : 'is')
  if (state === 'ERROR') return 'errored'
  if (state === 'UPLOADED') return `${plural(count)} pending`
  if (state === 'PROCESSED') return 'successful'
}

function useUploads() {
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
    isUploads: !uploads || uploads.length === 0,
  }
}

function UploadsCard() {
  const [showYAMLModal, setShowYAMLModal] = useState(false)
  const { uploadProviderList, uploadOverview, sortedUploads, isUploads } =
    useUploads()

  return (
    <>
      <div className="flex flex-1 flex-col border border-ds-gray-secondary text-ds-gray-octonary">
        <div className="flex p-4 border-b border-ds-gray-secondary flex-col">
          <div className="flex justify-between text-base">
            <h2 className="font-semibold">Uploads</h2>
            <A onClick={() => setShowYAMLModal(true)} hook="open yaml modal">
              <span className="text-xs">view yml file</span>
            </A>
          </div>
          <span className="text-ds-gray-quinary">{uploadOverview}</span>
        </div>
        <div className="bg-ds-gray-primary h-64 max-h-64 overflow-auto flex flex-col flex-1 divide-y divide-solid divide-ds-gray-secondary">
          {uploadProviderList.map((title) => (
            <UploadGroup
              key={title}
              title={title}
              uploads={sortedUploads[title]}
            />
          ))}
          {isUploads && (
            <span className="py-2.5 px-4 text-xs text-ds-gray-quinary">
              Currently no uploads
            </span>
          )}
        </div>
      </div>
      <YamlModal
        showYAMLModal={showYAMLModal}
        setShowYAMLModal={setShowYAMLModal}
      />
    </>
  )
}

export default UploadsCard
