import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'

import config from 'config'

import { Branch, useBranches } from 'services/branches'
import A from 'ui/A'
import Select from 'ui/Select'
import SettingsDescriptor from 'ui/SettingsDescriptor'
import TokenWrapper from 'ui/TokenWrapper'

type createBadgesArgs = {
  graphToken: string
  provider: string
  owner: string
  repo: string
  branch: Branch
}

const createBadges = ({
  graphToken,
  provider,
  owner,
  repo,
  branch,
}: createBadgesArgs) => {
  const repoPath = `${config.BASE_URL}/${provider}/${owner}/${repo}`
  const branchPath =
    branch.name === 'Default branch'
      ? ''
      : `/branch/${encodeURIComponent(branch.name)}`
  const fullPath = `${repoPath}${branchPath}/graph/badge.svg?token=${graphToken}`

  const BadgesEnum = {
    MARKDOWN: `[![codecov](${fullPath})](${repoPath})`,
    HTML: `<a href="${repoPath}" > \n <img src="${fullPath}"/> \n </a>`,
    RST: `.. image:: ${fullPath} \n :target: ${repoPath}`,
  } as const

  return BadgesEnum
}

type BadgesProps = {
  graphToken: string
}

type URLParams = {
  provider: string
  owner: string
  repo: string
}

export default function Badges({ graphToken }: BadgesProps) {
  const { provider, owner, repo } = useParams<URLParams>()
  const [branchSearchTerm, setBranchSearchTerm] = useState<string>()
  const [selection, setSelection] = useState<Branch>({
    name: 'Default branch',
    head: null,
  })
  const {
    data: branchList,
    isFetching: branchListIsFetching,
    hasNextPage: branchListHasNextPage,
    fetchNextPage: branchListFetchNextPage,
  } = useBranches({
    repo,
    owner,
    provider,
    filters: { searchValue: branchSearchTerm },
    opts: {
      suspense: false,
    },
  })

  const items = useMemo(() => {
    const defaultBranch: Branch = { name: 'Default branch', head: null }
    if (branchList?.branches) {
      return [defaultBranch, ...branchList.branches]
    }
    return [defaultBranch]
  }, [branchList])

  const BadgesEnum = createBadges({
    graphToken,
    provider,
    owner,
    repo,
    branch: selection,
  })

  return (
    <SettingsDescriptor
      title="Codecov badge"
      description={
        <>
          A live icon that you can embed in code, such as in a README.md, to
          provide quick insight into your project&apos;s code coverage
          percentage. {/* @ts-expect-error */}
          <A to={{ pageName: 'statusBadges' }}>Learn more</A>
        </>
      }
      content={
        <>
          <div className="mb-2 flex items-center gap-4 border-b pb-4">
            <p>Optionally, select a branch:</p>
            <div className="flex-1">
              <Select
                // @ts-expect-error - Select has some TS issues because it's still written in JS
                placeholder="Default branch"
                dataMarketing="branch-selector-coverage-badge"
                ariaName="badge branch selector"
                items={items}
                value={selection}
                onChange={setSelection}
                variant="gray"
                renderItem={(item: Branch) => <span>{item?.name}</span>}
                isLoading={branchListIsFetching}
                onLoadMore={() => {
                  if (branchListHasNextPage) {
                    branchListFetchNextPage()
                  }
                }}
                onSearch={(term: string) => setBranchSearchTerm(term)}
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <h2 className="font-semibold">Markdown</h2>
            <TokenWrapper token={BadgesEnum.MARKDOWN} />
          </div>
          <div className="flex flex-col gap-2">
            <h2 className="font-semibold">HTML</h2>
            <TokenWrapper token={BadgesEnum.HTML} />
          </div>
          <div className="flex flex-col gap-2">
            <h2 className="font-semibold">RST</h2>
            <TokenWrapper token={BadgesEnum.RST} />
          </div>
        </>
      }
    />
  )
}
