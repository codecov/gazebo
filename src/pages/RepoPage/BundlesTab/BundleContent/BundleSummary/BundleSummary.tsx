import { Branch } from 'services/branches'
import A from 'ui/A'
import Icon from 'ui/Icon'
import Select from 'ui/Select'
import { SummaryField, SummaryRoot } from 'ui/Summary'

import { useBundleSummary } from './hooks/useBundleSummary'

const BundleSummary: React.FC = () => {
  const {
    branchSelectorProps,
    setBranchSearchTerm,
    branchList,
    branchListIsFetching,
    branchListHasNextPage,
    branchesFetchNextPage,
    branchListFetchNextPage,
    currentBranchSelected,
  } = useBundleSummary()

  return (
    <div className="py-4">
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
              // @ts-expect-error Select needs to be typed
              ariaName="bundle branch selector"
              // TODO: Update this to update navigation once branches have been
              // added to the route
              onChange={(item: Branch) => {}}
              variant="gray"
              renderItem={(item: Branch) => <span>{item?.name}</span>}
              isLoading={branchListIsFetching}
              onLoadMore={() => {
                if (branchListHasNextPage) {
                  branchesFetchNextPage()
                  branchListFetchNextPage()
                }
              }}
              onSearch={(term: string) => setBranchSearchTerm(term)}
              items={branchList}
            />
            {currentBranchSelected?.head?.commitid && (
              <p className="pt-2 text-xs">
                <span className="font-bold">Source:</span> latest commit{' '}
                <A
                  isExternal={false}
                  hook="repo-page-bundle-summary-commit-link"
                  to={{
                    pageName: 'commit',
                    options: { commit: currentBranchSelected?.head?.commitid },
                  }}
                >
                  {currentBranchSelected?.head?.commitid.slice(0, 7)}
                </A>
              </p>
            )}
          </span>
        </SummaryField>
      </SummaryRoot>
    </div>
  )
}

export default BundleSummary
