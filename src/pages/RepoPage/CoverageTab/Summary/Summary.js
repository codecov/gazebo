import Progress from 'ui/Progress'
import { SummaryField, SummaryRoot } from 'ui/Summary'

import { useSummary } from './hooks'

const Summary = () => {
  const { data } = useSummary()
  return (
    <SummaryRoot>
      <SummaryField>Orym</SummaryField>
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
    </SummaryRoot>
  )
}

export default Summary
