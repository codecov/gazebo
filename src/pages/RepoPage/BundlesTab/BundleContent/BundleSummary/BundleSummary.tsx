import { useHistory } from 'react-router-dom'

import { Branch } from 'services/branches'
import { useNavLinks } from 'services/navigation'
import A from 'ui/A'
import Icon from 'ui/Icon'
import Select from 'ui/Select'
import { SummaryField, SummaryRoot } from 'ui/Summary'

import { useBundleSummary } from './hooks/useBundleSummary'

const BundleSummary: React.FC = () => {
  const { bundles } = useNavLinks()
  const history = useHistory()

  const {
    defaultBranch,
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
              dataMarketing="branch-selector-bundle-tab"
              {...branchSelectorProps}
              // @ts-expect-error Select needs to be typed
              ariaName="bundle branch selector"
              onChange={(item: Branch) => {
                if (item?.name === defaultBranch) {
                  history.push(bundles.path())
                } else {
                  history.push(
                    bundles.path({ branch: encodeURIComponent(item?.name) })
                  )
                }
              }}
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
