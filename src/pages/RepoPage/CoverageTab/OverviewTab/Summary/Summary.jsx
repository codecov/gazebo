import { Redirect, useParams } from 'react-router-dom'

import { useRepoConfig } from 'services/repo/useRepoConfig'
import { determineProgressColor } from 'shared/utils/determineProgressColor'
import A from 'ui/A'
import CoverageProgress from 'ui/CoverageProgress'
import Icon from 'ui/Icon'
import Select from 'ui/Select'
import { SummaryField, SummaryRoot } from 'ui/Summary'

import CoverageTrend from './CoverageTrend'

import { useCoverageRedirect, useSummary } from '../summaryHooks'

const YAML_STATE = Object.freeze({
  DEFAULT: 'DEFAULT',
})

const Summary = () => {
  const { provider, owner, repo } = useParams()
  const { setNewPath, redirectState } = useCoverageRedirect()
  const { data: repoConfigData } = useRepoConfig({ provider, owner, repo })

  const {
    data,
    currentBranchSelected,
    branchSelectorProps,
    branchesFetchNextPage,
    branchList,
    branchListIsFetching,
    branchListHasNextPage,
    branchListFetchNextPage,
    setBranchSearchTerm,
  } = useSummary()

  const onChangeHandler = ({ name }) => {
    setNewPath(name)
  }

  return (
    <>
      {redirectState?.isRedirectionEnabled && (
        <Redirect to={redirectState?.newPath} />
      )}
      <SummaryRoot>
        <SummaryField>
          <h3 className="flex items-center gap-1 text-sm font-semibold text-ds-gray-octonary">
            <span className="text-ds-gray-quinary">
              <Icon name="branch" size="sm" variant="developer" />
            </span>
            Branch Context
          </h3>
          <span className="min-w-64 text-sm">
            <Select
              dataMarketing="branch-selector-repo-page"
              {...branchSelectorProps}
              ariaName="select branch"
              onChange={onChangeHandler}
              variant="gray"
              renderItem={(item) => <span>{item?.name}</span>}
              isLoading={branchListIsFetching}
              onLoadMore={() => {
                if (branchListHasNextPage) {
                  branchesFetchNextPage()
                  branchListFetchNextPage()
                }
              }}
              onSearch={(term) => setBranchSearchTerm(term)}
              items={branchList}
            />
          </span>

          {currentBranchSelected?.head?.commitid && (
            <p className="text-xs">
              <span className="font-bold">Source:</span> latest commit{' '}
              <A
                to={{
                  pageName: 'commit',
                  options: { commit: currentBranchSelected?.head?.commitid },
                }}
              >
                {currentBranchSelected?.head?.commitid.slice(0, 7)}
              </A>
            </p>
          )}
        </SummaryField>
        {data?.head?.totals?.percentCovered && (
          <SummaryField>
            <h3 className="min-w-64 text-sm font-semibold  text-ds-gray-octonary">
              Coverage on branch
            </h3>
            <CoverageProgress
              label
              amount={data?.head?.totals?.percentCovered}
              variant="tall"
              color={determineProgressColor({
                coverage: data?.head?.totals?.percentCovered,
                ...repoConfigData?.indicationRange,
              })}
            />
            <p className="text-xs">
              {data?.head?.totals?.hitsCount} of {data?.head?.totals?.lineCount}{' '}
              lines covered
            </p>
          </SummaryField>
        )}
        <CoverageTrend />
        {data?.head?.yamlState === YAML_STATE.DEFAULT && (
          <SummaryField>
            <h3 className="min-w-32 text-sm font-semibold text-ds-gray-octonary">
              YAML Configuration
            </h3>
            <p className="pb-[2.0rem] text-sm">
              <A to={{ pageName: 'codecovYaml' }}>Learn more</A> about PR
              comment, target and flags
            </p>
          </SummaryField>
        )}
      </SummaryRoot>
    </>
  )
}

export default Summary
