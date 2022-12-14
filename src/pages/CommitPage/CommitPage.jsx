import isEmpty from 'lodash/isEmpty'
import PropTypes from 'prop-types'
import { lazy, Suspense } from 'react'
import { Redirect, Switch, useParams } from 'react-router-dom'

import { SentryRoute } from 'sentry'

import { useCommit } from 'services/commit'
import { useCommitErrors } from 'services/commitErrors'
import { useOwner } from 'services/user'
import Breadcrumb from 'ui/Breadcrumb'
import ToggleHeader from 'ui/FileViewer/ToggleHeader'
import Spinner from 'ui/Spinner'

import BotErrorBanner from './BotErrorBanner'
import ErroredUploads from './ErroredUploads'
import Header from './Header'
import CommitDetailsSummary from './Summary'
import UploadsCard from './UploadsCard'
import { useExtractUploads } from './UploadsCard/useExtractUploads'
import YamlErrorBanner from './YamlErrorBanner'

const CommitsTable = lazy(() => import('./subroute/CommitsTable'))
const NotFound = lazy(() => import('pages/NotFound'))

function CommitErrorBanners({
  isCurrentUserPartOfOrg,
  invalidYaml,
  botErrors,
}) {
  return (
    <>
      {isCurrentUserPartOfOrg && (
        <BotErrorBanner botErrorsCount={botErrors?.length} />
      )}
      {invalidYaml && <YamlErrorBanner />}
    </>
  )
}

CommitErrorBanners.propTypes = {
  isCurrentUserPartOfOrg: PropTypes.bool.isRequired,
  invalidYaml: PropTypes.shape({ errorCode: PropTypes.string }),
  botErrors: PropTypes.arrayOf({ errorCode: PropTypes.string }),
}

function CommitPage() {
  const { provider, owner, repo, commit: commitSHA } = useParams()
  const { data, isLoading } = useCommit({
    provider,
    owner,
    repo,
    commitid: commitSHA,
  })
  const commit = data?.commit
  const { erroredUploads } = useExtractUploads({ uploads: commit?.uploads })

  const {
    data: { yamlErrors, botErrors },
  } = useCommitErrors()
  const invalidYaml = yamlErrors?.find(
    (err) => err?.errorCode === 'invalid_yaml'
  )
  const { data: ownerData } = useOwner({ username: owner })

  const loadingState = (
    <div className="flex-1 flex justify-center m-4">
      <Spinner size={60} />
    </div>
  )

  const shortSHA = commitSHA?.slice(0, 7)

  return !isLoading && commit ? (
    <div className="flex gap-4 flex-col px-3 sm:px-0">
      <Breadcrumb
        paths={[
          { pageName: 'owner', text: owner },
          { pageName: 'repo', text: repo },

          { pageName: 'commits', text: 'commits' },
          {
            pageName: 'commit',
            options: { commitSHA },
            readOnly: true,
            text: shortSHA,
          },
        ]}
      />
      <Header />
      <CommitDetailsSummary />
      {/**we are currently capturing a single error*/}
      <CommitErrorBanners
        isCurrentUserPartOfOrg={ownerData?.isCurrentUserPartOfOrg}
        invalidYaml={invalidYaml}
        botErrors={botErrors}
      />
      <div className="flex pt-6 flex-col gap-8 md:flex-row-reverse">
        <aside className="flex flex-1 gap-6 md:max-w-sm flex-col self-start sticky top-1.5">
          <UploadsCard />
        </aside>
        <article className="flex flex-1 flex-col gap-4">
          <Switch>
            <SentryRoute path="/:provider/:owner/:repo/commit/:commit">
              <ToggleHeader title="Impacted Files" coverageIsLoading={false} />
              {!isEmpty(erroredUploads) ? (
                <ErroredUploads erroredUploads={erroredUploads} />
              ) : (
                <Suspense fallback={loadingState}>
                  <CommitsTable
                    commit={commitSHA}
                    state={commit?.state}
                    data={commit?.compareWithParent?.impactedFiles}
                  />
                </Suspense>
              )}
            </SentryRoute>
            <Redirect
              from="/:provider/:owner/:repo/commit/:commit/*"
              to="/:provider/:owner/:repo/commit/:commit"
            />
          </Switch>
        </article>
      </div>
    </div>
  ) : (
    <Suspense fallback={loadingState}>
      <NotFound />
    </Suspense>
  )
}

export default CommitPage
