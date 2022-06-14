import { useLayoutEffect } from 'react'
import { Redirect } from 'react-router-dom'

import { useSetCrumbs } from 'pages/RepoPage/context'
import A from 'ui/A'
import Icon from 'ui/Icon'
import Progress from 'ui/Progress'
import Select from 'ui/Select'
import { SummaryField, SummaryRoot } from 'ui/Summary'

import { useCoverageRedirect, useSummary } from './hooks'

const Summary = () => {
  const setCrumbs = useSetCrumbs()
  const { data, currentBranchSelected, branchSelectorProps } = useSummary()
  const { setNewPath, state: redirectState } = useCoverageRedirect()

  useLayoutEffect(() => {
    setCrumbs([
      {
        pageName: '',
        readOnly: true,
        children: (
          <span className="flex items-center gap-1">
            <Icon name="branch" variant="developer" size="sm" />
            {currentBranchSelected?.name}
          </span>
        ),
      },
    ])
  }, [currentBranchSelected?.name, setCrumbs])

  const onChangeHandler = ({ name }) => {
    setNewPath(name)
  }

  return (
    <>
      {redirectState?.newPath}
      {redirectState?.isRedirectionEnabled && (
        <Redirect to={redirectState?.newPath} />
      )}
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
              onChange={onChangeHandler}
              variant="gray"
              renderItem={(item) => <span>{item?.name}</span>}
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
            <h3 className="text-ds-gray-octonary text-sm font-semibold  min-w-[16rem]">
              Branch Coverage
            </h3>
            <Progress
              label
              amount={data?.head?.totals?.percentCovered}
              variant="tall"
            />
            <p className="text-xs">
              {data?.head?.totals?.hitsCount} of {data?.head?.totals?.lineCount}{' '}
              lines covered
            </p>
          </SummaryField>
        )}
      </SummaryRoot>
    </>
  )
}

export default Summary
