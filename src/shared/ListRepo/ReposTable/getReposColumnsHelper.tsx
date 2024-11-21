import { createColumnHelper } from '@tanstack/react-table'

import { RepositoryResult } from 'services/repos'
import { formatTimeToNow } from 'shared/utils/dates'
import TotalsNumber from 'ui/TotalsNumber'

import NoRepoCoverage from './NoRepoCoverage'

import InactiveRepo from '../InactiveRepo'
import RepoTitleLink from '../RepoTitleLink'

export const getReposColumnsHelper = ({
  inactive,
  isCurrentUserPartOfOrg,
  owner,
}: {
  inactive: boolean
  isCurrentUserPartOfOrg: boolean
  owner: string
}) => {
  const columnHelper = createColumnHelper<
    RepositoryResult & { isDemo?: boolean }
  >()
  const nameColumn = columnHelper.accessor('name', {
    header: 'Name',
    id: 'name',
    cell: (info) => {
      const repo = info.row.original

      let pageName = 'new'
      if (repo?.isDemo) {
        pageName = 'demoRepo'
      } else if (repo?.coverageEnabled) {
        pageName = 'repo'
      } else if (repo?.bundleAnalysisEnabled) {
        pageName = 'bundles'
      }

      return (
        <RepoTitleLink
          repo={repo}
          showRepoOwner={!owner}
          pageName={pageName}
          disabledLink={!isCurrentUserPartOfOrg && !repo?.active}
        />
      )
    },
  })

  if (inactive) {
    return [
      nameColumn,
      columnHelper.accessor('active', {
        header: '',
        id: 'inactiveRepo',
        cell: (info) => {
          const repo = info.row.original
          return (
            <InactiveRepo
              owner={repo?.author?.username ?? ''}
              repoName={repo?.name}
              isCurrentUserPartOfOrg={isCurrentUserPartOfOrg}
              isActive={false}
            />
          )
        },
      }),
    ]
  }

  return [
    nameColumn,
    columnHelper.accessor('latestCommitAt', {
      header: 'Last updated',
      id: 'latestCommitAt',
      cell: (info) => {
        return (
          <span className="text-ds-gray-quinary">
            {info?.renderValue() ? formatTimeToNow(info?.renderValue()) : ''}
          </span>
        )
      },
    }),
    columnHelper.accessor('coverageAnalytics.lines', {
      header: 'Tracked lines',
      id: 'lines',
      cell: (info) => {
        const repo = info.row.original
        return (
          <>
            <div className="mr-5 text-right">
              {repo?.coverageAnalytics?.lines}
            </div>
          </>
        )
      },
    }),
    columnHelper.accessor('coverageAnalytics.percentCovered', {
      header: 'Test coverage',
      id: 'coverage',
      cell: (info) => {
        const repo = info.row.original
        return typeof repo?.coverageAnalytics?.percentCovered === 'number' ? (
          <TotalsNumber
            value={repo.coverageAnalytics?.percentCovered}
            plain={true}
            light={false}
            showChange={false}
            large={false}
          />
        ) : (
          <NoRepoCoverage
            activated={repo?.activated}
            active={repo?.active}
            isCurrentUserPartOfOrg={isCurrentUserPartOfOrg}
            repoName={repo?.name}
            owner={repo?.author.username}
          />
        )
      },
    }),
  ]
}
