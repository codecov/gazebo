import { useLayoutEffect } from 'react'
import { Redirect } from 'react-router-dom'

import { useSetCrumbs } from 'pages/RepoPage/context'
import A from 'ui/A'
import Icon from 'ui/Icon'
import Progress from 'ui/Progress'
import Select from 'ui/Select'
import { SummaryField, SummaryRoot } from 'ui/Summary'

import { useSummary } from './hooks'

const Summary = () => {
  const {
    coverage,
    data,
    defaultBranch,
    currenBranchSelected,
    privateRepo,
    branchSelectorProps,
    newPath,
    enableRedirection,
  } = useSummary()
  const setCrumbs = useSetCrumbs()

  useLayoutEffect(() => {
    setCrumbs([
      {
        pageName: '',
        readOnly: true,
        children: (
          <span className="flex items-center gap-1">
            <Icon name="branch" variant="developer" size="sm" />
            {currenBranchSelected?.name}
            {privateRepo && (
              <Icon name="lock-closed" variant="solid" size="sm" />
            )}
          </span>
        ),
      },
    ])
  }, [currenBranchSelected?.name, setCrumbs, privateRepo])

  return (
    <>
      {enableRedirection && <Redirect to={newPath} />}
      <SummaryRoot>
        <SummaryField>
          <h3 className="text-ds-gray-octonary text-sm font-semibold flex gap-1 items-center">
            <span className="text-ds-gray-quinary">
              <Icon name="branch" size="sm" variant="developer" />
            </span>
            Branch Context
          </h3>
          <span className="text-sm min-w-[16rem]">
            <Select
              {...branchSelectorProps}
              variant="gray"
              renderItem={(item, { placeholder }) => (
                <span>{item?.name || placeholder}</span>
              )}
            />
          </span>

          {currenBranchSelected?.head?.commitid && (
            <p className="text-xs">
              <span className="font-bold">Source:</span> latest commit{' '}
              <A
                to={{
                  pageName: 'commit',
                  options: { commit: currenBranchSelected?.head?.commitid },
                }}
              >
                {currenBranchSelected?.head?.commitid.slice(0, 7)}
              </A>
            </p>
          )}
        </SummaryField>
        <SummaryField>
          <h3 className="text-ds-gray-octonary text-sm font-semibold  min-w-[16rem]">
            Repo Coverage
          </h3>
          <Progress label amount={coverage} variant="tall" />
          {/* Not yet in api*/}
          <p className="text-xs">-- of -- lines covered</p>
        </SummaryField>
        {data?.name !== defaultBranch && data?.head?.totals?.percentCovered && (
          <SummaryField>
            <h3 className="text-ds-gray-octonary text-sm font-semibold  min-w-[16rem]">
              Branch Coverage
            </h3>
            <Progress
              label
              amount={data?.head?.totals?.percentCovered}
              variant="tall"
            />
            {/* Not yet in api*/}
            <p className="text-xs">-- of -- lines covered</p>
          </SummaryField>
        )}
      </SummaryRoot>
    </>
  )
}

export default Summary
