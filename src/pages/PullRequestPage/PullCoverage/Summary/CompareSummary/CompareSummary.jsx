import PropTypes from 'prop-types'
import qs from 'qs'
import { useLocation, useParams } from 'react-router-dom'

import { getProviderCommitURL } from 'shared/utils'
import { deleteDuplicateCFFUploads } from 'shared/utils/extractUploads'
import { mapEdges } from 'shared/utils/graphql'
import A from 'ui/A'
import Icon from 'ui/Icon'
import Summary from 'ui/Summary'
import TotalsNumber from 'ui/TotalsNumber'

import { usePullForCompareSummary } from './usePullForCompareSummary'

function totalsCards({
  headCoverage,
  headCommit,
  patchCoverage,
  changeCoverage,
}) {
  return [
    {
      name: 'head',
      title: (
        <>
          <span>HEAD</span>
          {headCommit && (
            <span className="text-ds-gray-octonary">
              {headCommit.slice(0, 7)}
            </span>
          )}
        </>
      ),
      value: <TotalsNumber value={headCoverage} large plain />,
    },
    {
      name: 'patch',
      title: 'Patch',
      value: <TotalsNumber value={patchCoverage} large plain />,
    },
    {
      name: 'change',
      title: 'Change',
      value: (
        <TotalsNumber
          value={changeCoverage}
          showChange
          large
          data-testid="change-value"
        />
      ),
    },
  ]
}

function BehindByCommits({ behindByCommit, behindBy, defaultBranch }) {
  const { owner, repo, provider } = useParams()

  if (!behindBy || !behindByCommit) return null

  return (
    <p className="text-xs text-ds-gray-quinary">
      BASE commit is <span>{behindBy}</span> commits behind HEAD on{' '}
      <span>{defaultBranch}</span>{' '}
      <A
        variant="code"
        href={getProviderCommitURL({
          provider,
          owner,
          repo,
          commit: behindByCommit,
        })}
        hook="provider commit url"
        isExternal={true}
      >
        {behindByCommit?.slice(0, 7)}
      </A>
    </p>
  )
}

BehindByCommits.propTypes = {
  behindByCommit: PropTypes.string,
  behindBy: PropTypes.number,
  defaultBranch: PropTypes.string,
}

function CardWithDifferentNumberOfUploads({
  head,
  base,
  headCommit,
  baseCommit,
  behindBy,
  behindByCommit,
  defaultBranch,
  flags = [],
}) {
  const headUploads = deleteDuplicateCFFUploads({
    uploads: mapEdges(head?.uploads),
  })

  const baseUploads = deleteDuplicateCFFUploads({
    uploads: mapEdges(base?.uploads),
  })

  return (
    <div className="flex flex-col gap-1">
      <p className="text-sm text-ds-gray-octonary">
        Coverage data is based on{' '}
        <span className="font-medium uppercase">head</span>{' '}
        <A
          to={{
            pageName: 'commit',
            options: { commit: headCommit, queryParams: { flags } },
          }}
        >
          {headCommit?.slice(0, 7)}
          <span>({headUploads?.length} uploads)</span>
        </A>{' '}
        compared to <span className="font-medium uppercase">base</span>{' '}
        <A
          to={{
            pageName: 'commit',
            options: { commit: baseCommit, queryParams: { flags } },
          }}
        >
          {baseCommit?.slice(0, 7)}
          <span>({baseUploads?.length} uploads)</span>
        </A>{' '}
      </p>
      <div className="flex gap-1 text-sm">
        <div className="text-ds-primary-yellow">
          <Icon name="exclamation-triangle" size="sm" variant="outline" />
        </div>
        <p className="text-xs">
          Commits have different number of coverage report uploads{' '}
          <A
            variant="semibold"
            hook="learn-more"
            href={
              'https://docs.codecov.com/docs/unexpected-coverage-changes#mismatching-base-and-head-commit-upload-counts'
            }
            isExternal
          >
            learn more
          </A>{' '}
        </p>
      </div>
      <BehindByCommits
        behindByCommit={behindByCommit}
        behindBy={behindBy}
        defaultBranch={defaultBranch}
      />
    </div>
  )
}

CardWithDifferentNumberOfUploads.propTypes = {
  head: PropTypes.shape({
    uploads: PropTypes.shape({
      totalCount: PropTypes.number,
    }),
  }),
  base: PropTypes.shape({
    uploads: PropTypes.shape({
      totalCount: PropTypes.number,
    }),
  }),
  headCommit: PropTypes.string,
  baseCommit: PropTypes.string,
  behindBy: PropTypes.number,
  behindByCommit: PropTypes.string,
  defaultBranch: PropTypes.string,
  flags: PropTypes.array,
}

function CardWithSameNumberOfUploads({
  headCommit,
  baseCommit,
  behindBy,
  behindByCommit,
  defaultBranch,
  flags = [],
}) {
  return (
    <p className="text-sm text-ds-gray-octonary">
      Coverage data is based on{' '}
      <span className="font-medium uppercase">head</span>{' '}
      <A
        to={{
          pageName: 'commit',
          options: { commit: headCommit, queryParams: { flags } },
        }}
      >
        {headCommit?.slice(0, 7)}
      </A>{' '}
      compared to <span className="font-medium uppercase">base</span>{' '}
      <A
        to={{
          pageName: 'commit',
          options: { commit: baseCommit, queryParams: { flags } },
        }}
      >
        {baseCommit?.slice(0, 7)}
      </A>{' '}
      <BehindByCommits
        behindByCommit={behindByCommit}
        behindBy={behindBy}
        defaultBranch={defaultBranch}
      />
    </p>
  )
}

CardWithSameNumberOfUploads.propTypes = {
  headCommit: PropTypes.string,
  baseCommit: PropTypes.string,
  behindBy: PropTypes.number,
  behindByCommit: PropTypes.string,
  defaultBranch: PropTypes.string,
  flags: PropTypes.array,
}

function compareCards({
  head,
  base,
  hasDifferentNumberOfHeadAndBaseReports,
  behindBy,
  behindByCommit,
  defaultBranch,
  flags = [],
}) {
  const headCommit = head?.commitid
  const baseCommit = base?.commitid
  return [
    {
      name: 'source',
      title: 'Source',
      value:
        headCommit && baseCommit ? (
          <>
            {hasDifferentNumberOfHeadAndBaseReports ? (
              <CardWithDifferentNumberOfUploads
                head={head}
                base={base}
                headCommit={headCommit}
                baseCommit={baseCommit}
                behindBy={behindBy}
                behindByCommit={behindByCommit}
                defaultBranch={defaultBranch}
                flags={flags}
              />
            ) : (
              <CardWithSameNumberOfUploads
                headCommit={headCommit}
                baseCommit={baseCommit}
                behindBy={behindBy}
                behindByCommit={behindByCommit}
                defaultBranch={defaultBranch}
                flags={flags}
              />
            )}
          </>
        ) : (
          <span className="text-sm">Coverage data is unknown</span>
        ),
    },
  ]
}

function pendingCard({ patchCoverage, headCoverage, changeCoverage }) {
  const card = []

  if (!patchCoverage && !headCoverage && !changeCoverage) {
    card.push({
      name: 'pending',
      value: (
        <p className="mt-2 max-w-xs border-l border-solid border-ds-gray-secondary pl-4 text-sm text-ds-gray-octonary">
          <span className="font-medium">Why is there no coverage data?</span>{' '}
          the data is not yet available and still processing.
        </p>
      ),
    })
  }
  return card
}

function lastCommitErrorCard({ recentCommit, flags = [] }) {
  const card = []

  if (recentCommit?.state?.toLowerCase() === 'error') {
    card.push({
      name: 'error',
      value: (
        <span className="flex max-w-xs gap-2 border-l border-solid border-ds-gray-secondary pl-4">
          <span className="text-ds-primary-red">
            <Icon name="exclamation" />
          </span>
          <p className="text-sm text-ds-gray-octonary">
            There is an error processing the coverage reports with{' '}
            <A
              to={{
                pageName: 'commit',
                options: {
                  commit: recentCommit?.commitid,
                  queryParams: { flags },
                },
              }}
            >
              {recentCommit?.commitid?.slice(0, 7)}
            </A>
            . As a result, some of the information may not be accurate.
          </p>
        </span>
      ),
    })
  }
  return card
}

function CompareSummary() {
  const {
    headCoverage,
    patchCoverage,
    changeCoverage,
    recentCommit,
    head,
    base,
    hasDifferentNumberOfHeadAndBaseReports,
    behindBy,
    behindByCommit,
    defaultBranch,
  } = usePullForCompareSummary()
  const { search } = useLocation()
  const searchParams = qs.parse(search, { ignoreQueryPrefix: true })
  const flags = searchParams?.flags ?? []

  const fields = [
    ...totalsCards({
      headCoverage,
      headCommit: head?.commitid,
      patchCoverage,
      changeCoverage,
    }),
    ...compareCards({
      head,
      base,
      hasDifferentNumberOfHeadAndBaseReports,
      behindBy,
      behindByCommit,
      defaultBranch,
      flags,
    }),
    ...pendingCard({ patchCoverage, headCoverage, changeCoverage, flags }),
    ...lastCommitErrorCard({ recentCommit, flags }),
  ]

  return (
    <div className="border-b border-ds-gray-secondary pb-4">
      <Summary fields={fields} />
    </div>
  )
}

export default CompareSummary
