import { useState, lazy, Suspense } from 'react'
import { useParams } from 'react-router-dom'
import Modal from 'ui/Modal'
import CoverageReportCard from './CoverageReportCard'
import UploadsCard from './UploadsCard'
import CommitsTable from './CommitsTable'
import Breadcrumb from 'ui/Breadcrumb'
import Spinner from 'ui/Spinner'
import { useCommit } from 'services/commit'
import formatDistanceToNow from 'date-fns/formatDistanceToNow'
import Icon from 'ui/Icon'
import AppLink from 'shared/AppLink'
import { getProviderCommitURL } from './helpers'
const NotFound = lazy(() => import('../NotFound'))

const YAMLViewer = lazy(() => import('./YAMLViewer'))

function CommitPage() {
  const { provider, owner, repo, commit } = useParams()
  const [showYAMLModal, setShowYAMLModal] = useState(false)
  const loadingState = <Spinner size={40} />

  const { data } = useCommit({
    provider: provider,
    owner,
    repo,
    commitid: commit,
  })

  const commitid = commit?.substr(0, 7)

  return (
    <>
      {data ? (
        <div className="flex flex-col">
          <div className="w-full flex border-b border-ds-gray-secondary pb-3">
            <Breadcrumb
              paths={[
                { pageName: 'owner', text: owner },
                { pageName: 'repo', text: repo },
                { pageName: 'commits' },
                { pageName: commit, readOnly: true, text: commitid },
              ]}
            />
          </div>
          <span className="mt-4 text-lg font-semibold text-ds-gray-octonary">
            {data?.commit?.message}
          </span>
          <div className="flex items-center mt-1 text-ds-gray-quinary">
            {formatDistanceToNow(new Date(data?.commit?.createdAt), {
              addSuffix: true,
            })}{' '}
            <AppLink
              pageName="owner"
              options={{ owner: data?.commit?.author?.username }}
              className="text-ds-gray-octonary mx-1 hover:underline"
            >
              {data?.commit?.author?.username}
            </AppLink>{' '}
            authored commit
            <a
              className="flex ml-1.5 items-center hover:underline font-mono text-ds-blue-darker"
              href={`${getProviderCommitURL({
                provider,
                owner,
                repo,
                commit,
              })}`}
            >
              {commitid}
              <div className="text-ds-gray-quinary ml-0.5">
                <Icon size="sm" name="external-link" />
              </div>
            </a>
          </div>
          <hr className="mt-6" />
          <div className="flex flex-col md:flex-row mt-8">
            <div className="flex w-full mr-8 md:max-w-sm flex-col">
              <div className="">
                <CoverageReportCard
                  provider={provider}
                  repo={repo}
                  owner={owner}
                  data={data?.commit}
                />
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
              <span className="text-base mb-4 font-semibold">
                Impacted files
              </span>
              <CommitsTable />
            </div>
          </div>
        </div>
      ) : (
        <Suspense fallback={loadingState}>
          <NotFound />
        </Suspense>
      )}
    </>
  )
}

export default CommitPage
