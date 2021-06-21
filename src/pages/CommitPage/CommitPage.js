import { useState, lazy, Suspense } from 'react'
import { useParams } from 'react-router-dom'
import Modal from 'ui/Modal'
import CoverageReportCard from './CoverageReportCard'
import UploadsCard from './UploadsCard'
import CommitsTable from './CommitsTable'
import Breadcrumb from 'ui/Breadcrumb'
import Spinner from 'ui/Spinner'
import { useCommit } from 'services/commit/hooks'
import formatDistanceToNow from 'date-fns/formatDistanceToNow'

const YAMLViewer = lazy(() => import('./YAMLViewer'))

function CommitPage() {
  const { owner, repo, commit } = useParams()
  const [showYAMLModal, setShowYAMLModal] = useState(false)
  const loadingState = <Spinner size={40} />

  const { data } = useCommit({
    provider: 'gh',
    owner,
    repo,
    commitid: commit,
  })

  const commitid = commit?.substr(0, 7)

  return (
    <div className="flex flex-col">
      <div className="w-full flex border-b border-ds-gray-secondary pb-3">
        <Breadcrumb
          paths={[
            { pageName: 'owner', text: owner },
            { pageName: 'repo', text: repo },
            { pageName: 'commits' },
            { pageName: commitid, readOnly: true, text: commitid },
          ]}
        />
      </div>
      <span className="mt-4 text-lg font-semibold text-ds-gray-octonary">
        {data?.commit?.message}
      </span>
      <div className="flex mt-1 text-ds-gray-quinary">
        {formatDistanceToNow(new Date(data?.commit?.createdAt), {
          addSuffix: true,
        })}{' '}
        <span className="text-ds-gray-octonary mx-1">
          {data?.commit?.author?.username}
        </span>{' '}
        authored commit
        <a className="ml-1.5 font-mono text-ds-blue-darker" href="somethinf">
          {commitid}
        </a>
      </div>
      <hr className="mt-6" />
      <div className="flex flex-col md:flex-row mt-8">
        <div className="flex w-full mr-8 md:max-w-sm flex-col">
          <div className="">
            <CoverageReportCard data={data?.commit} />
          </div>
          <div className="mt-2 md:mt-8">
            <UploadsCard
              data={data?.commit?.uploads}
              showYAMLModal={showYAMLModal}
              setShowYAMLModal={setShowYAMLModal}
            />
            {showYAMLModal && (
              <Modal
                isOpen={true}
                onClose={() => setShowYAMLModal(false)}
                title="Yaml"
                body={
                  <Suspense fallback={loadingState}>
                    <YAMLViewer YAML={data?.commit?.yaml || ''} />
                  </Suspense>
                }
                footer={
                  <span className="text-sm w-full text-left">
                    Includes default yaml, global yaml, and repo{' '}
                    <a href="learnmore" className="text-ds-blue-darker">
                      learn more
                    </a>
                  </span>
                }
              />
            )}
          </div>
        </div>
        <div className="flex flex-col w-full mt-2 md:mt-0">
          <span className="text-base mb-4 font-semibold">Impacted files</span>
          <CommitsTable />
        </div>
      </div>
    </div>
  )
}

export default CommitPage
