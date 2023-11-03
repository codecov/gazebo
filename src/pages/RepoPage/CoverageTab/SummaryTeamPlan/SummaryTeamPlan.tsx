import { useLayoutEffect } from 'react'
import { Redirect } from 'react-router-dom'

import { useSetCrumbs } from 'pages/RepoPage/context'
import A from 'ui/A'
import Icon from 'ui/Icon'
import Select from 'ui/Select'
import { SummaryField, SummaryRoot } from 'ui/Summary'

import { useCoverageRedirect, useSummary } from '../SummaryHooks'

const YAML_STATE = Object.freeze({
  DEFAULT: 'DEFAULT',
})

const Summary = () => {
  const setCrumbs = useSetCrumbs()
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

  useLayoutEffect(() => {
    setCrumbs([
      {
        pageName: '',
        readOnly: true,
        children: (
          <span className="inline-flex items-center gap-1">
            <Icon name="branch" variant="developer" size="sm" />
            {currentBranchSelected?.name}
          </span>
        ),
      },
    ])
  }, [currentBranchSelected?.name, setCrumbs])

  const onChangeHandler = ({ name }: { name: string }) => {
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
          <span className="min-w-[16rem] text-sm">
            <Select
              dataMarketing="branch-selector-repo-page"
              {...branchSelectorProps}
              /*// @ts-ignore */
              ariaName="select branch"
              onChange={onChangeHandler}
              variant="gray"
              renderItem={(item: any) => <span>{item?.name}</span>}
              isLoading={branchListIsFetching}
              onLoadMore={() => {
                if (branchListHasNextPage) {
                  branchesFetchNextPage()
                  branchListFetchNextPage()
                }
              }}
              onSearch={(term: any) => setBranchSearchTerm(term)}
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
                hook="coverage-summary-branch-commit-link"
                isExternal={false}
              >
                {currentBranchSelected?.head?.commitid.slice(0, 7)}
              </A>
            </p>
          )}
        </SummaryField>
        {data?.head?.yamlState === YAML_STATE.DEFAULT && (
          <SummaryField>
            <h3 className="min-w-[8rem] text-sm font-semibold text-ds-gray-octonary">
              Yaml Configuration
            </h3>
            <p className="pb-[2.0rem] text-sm">
              <A
                to={{ pageName: 'codecovYaml' }}
                hook="coverage-summary-yaml-link"
                isExternal={false}
              >
                Learn more
              </A>{' '}
              about PR comment, target and flags
            </p>
          </SummaryField>
        )}
      </SummaryRoot>
    </>
  )
}

export default Summary
