import { Redirect } from 'react-router-dom'

import A from 'ui/A'
import Icon from 'ui/Icon'
import Select from 'ui/Select'
import { SummaryField, SummaryRoot } from 'ui/Summary'

import { useSummary } from './hooks'

const Summary = () => {
  const {
    currenBranchSelected,
    branchSelectorProps,
    newPath,
    enableRedirection,
  } = useSummary()

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
              renderItem={(item) => <span>{item?.name}</span>}
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
      </SummaryRoot>
    </>
  )
}

export default Summary
