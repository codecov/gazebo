import { Redirect } from 'react-router-dom'

import A from 'ui/A'
import Icon from 'ui/Icon'
import Select from 'ui/Select'
import { SummaryField, SummaryRoot } from 'ui/Summary'

import { useCoverageRedirect, useSummary } from '../summaryHooks'

const YAML_STATE = Object.freeze({
  DEFAULT: 'DEFAULT',
})

const SummaryTeamPlan = () => {
  const { setNewPath, redirectState } = useCoverageRedirect()

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

  const onChangeHandler = ({ name }: { name: string }) => {
    setNewPath(name)
  }

  return (
    <>
      {redirectState?.isRedirectionEnabled && redirectState?.newPath ? (
        <Redirect to={redirectState.newPath} />
      ) : null}
      <SummaryRoot>
        <SummaryField>
          <div className="flex flex-row items-center gap-2">
            <span className="min-w-64 text-sm">
              <Select
                dataMarketing="branch-selector-repo-page"
                {...branchSelectorProps}
                // @ts-expect-error - Select hasn't been typed yet
                ariaName="select branch"
                onChange={onChangeHandler}
                variant="gray"
                renderItem={(item: { name: any }) => <span>{item?.name}</span>}
                isLoading={branchListIsFetching}
                onLoadMore={() => {
                  if (branchListHasNextPage) {
                    branchesFetchNextPage()
                    branchListFetchNextPage()
                  }
                }}
                onSearch={(term: any) => setBranchSearchTerm(term)}
                items={branchList}
                buttonIcon={
                  <span className="text-ds-gray-quinary">
                    <Icon
                      name="branch"
                      label="branch"
                      size="sm"
                      variant="developer"
                    />
                  </span>
                }
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
                  hook="coverage-summary-branch-commit-link"
                  isExternal={false}
                >
                  {currentBranchSelected?.head?.commitid.slice(0, 7)}
                </A>
              </p>
            )}
          </div>
        </SummaryField>
        {data?.head?.yamlState === YAML_STATE.DEFAULT && (
          <SummaryField>
            <h3 className="text-sm font-semibold text-ds-gray-octonary">
              YAML Configuration
            </h3>
            <p className="text-sm">
              <A
                to={{
                  pageName: 'codecovYaml',
                }}
                hook="codecov-yaml-link"
                isExternal={false}
              >
                Learn more
              </A>{' '}
              about PR comments, targets, and badges
            </p>
          </SummaryField>
        )}
      </SummaryRoot>
    </>
  )
}

export default SummaryTeamPlan
