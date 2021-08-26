import { useState, lazy, Suspense } from 'react'
import { useParams } from 'react-router-dom'
import formatDistanceToNow from 'date-fns/formatDistanceToNow'

import Modal from 'ui/Modal'
import Spinner from 'ui/Spinner'
import Breadcrumb from 'ui/Breadcrumb'
import A from 'ui/A'
import { useCommit } from 'services/commit'

import CoverageReportCard from './CoverageReportCard'
import UploadsCard from './UploadsCard'
import CommitsTable from './CommitsTable'
import { getProviderCommitURL } from './helpers'
import CommitFileView from './CommitFileView'
import Header from './Header'

const NotFound = lazy(() => import('../NotFound'))
const YAMLViewer = lazy(() => import('./YAMLViewer'))

function CommitPage() {
  const { provider, owner, repo, commit, path } = useParams()
  const [showYAMLModal, setShowYAMLModal] = useState(false)
  const loadingState = <Spinner size={40} />

  const { data, isSuccess } = useCommit({
    provider: provider,
    owner,
    repo,
    commitid: commit,
  })

  const commitid = commit?.substr(0, 7)
  function renderImpactedFiles() {
    return !path ? (
      <>
        <span className="text-base mb-4 font-semibold">Impacted files</span>
        <CommitsTable
          commit={commit}
          data={data?.commit?.compareWithParent?.impactedFiles}
        />
      </>
    ) : (
      <CommitFileView />
    )
  }

  return isSuccess ? (
    <div className="flex flex-col">
      <div className="w-full flex border-b border-ds-gray-secondary pb-3">
        <Breadcrumb
          paths={[
            { pageName: 'owner', text: owner },
            { pageName: 'repo', text: repo },
            { pageName: 'commits', text: 'commits' },
            {
              pageName: 'commit',
              options: { commit },
              readOnly: true,
              text: commitid,
            },
          ]}
        />
      </div>
      <Header provider={provider} />
      <span className="mt-4 text-lg font-semibold text-ds-gray-octonary">
        {data?.commit?.message}
      </span>
      <div className="flex items-center mt-1 text-ds-gray-quinary gap-1">
        {data?.commit?.createdAt
          ? formatDistanceToNow(new Date(data?.commit?.createdAt), {
              addSuffix: true,
            })
          : ''}
        <A
          to={{
            pageName: 'owner',
            options: { owner: data?.commit?.author?.username },
          }}
        >
          {data?.commit?.author?.username}
        </A>
        authored commit
        <A
          variant="code"
          href={getProviderCommitURL({
            provider,
            owner,
            repo,
            commit,
          })}
          hook="provider commit url"
          isExternal={true}
        >
          {commitid}
        </A>
      </div>
      <hr className="mt-6" />
      <div className="flex flex-col md:flex-row mt-8">
        <div className="flex w-full mr-8 md:max-w-sm flex-col">
          <CoverageReportCard
            provider={provider}
            repo={repo}
            owner={owner}
            data={data?.commit}
          />
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
                    <A
                      href="https://docs.codecov.com/docs/codecov-yaml"
                      hook="yaml learn more"
                      isExternal={true}
                    >
                      learn more
                    </A>
                  </span>
                }
              />
            )}
          </div>
        </div>
        <div className="flex flex-col w-full mt-2 md:mt-0">
          {renderImpactedFiles()}
        </div>
      </div>
    </div>
  ) : (
    <Suspense fallback={loadingState}>
      <NotFound />
    </Suspense>
  )
}

export default CommitPage
