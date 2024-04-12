import A from 'ui/A'
import Icon from 'ui/Icon'
import TotalsNumber from 'ui/TotalsNumber'

import { IconEnum, IconEnumState } from './enums'

interface PullStateProps {
  state: IconEnumState
}

const PullState: React.FC<PullStateProps> = ({ state }) => {
  const icon = IconEnum.find((item) => state === item.state) ?? IconEnum[0]

  return (
    <span className="flex items-center text-ds-gray-quinary">
      <Icon name={icon.name} variant="developer" size="sm" />
    </span>
  )
}

interface CoverageProps {
  head?: {
    totals?: {
      percentCovered: number | null
    } | null
    bundleAnalysisReport?: {
      __typename: string
    } | null
  } | null
  pullId: number
  state: IconEnumState
  plain?: boolean
}

const Coverage: React.FC<CoverageProps> = ({
  head,
  state,
  pullId,
  plain = false,
}) => {
  if (typeof head?.totals?.percentCovered === 'number') {
    return (
      <div className="flex flex-1 flex-wrap justify-end md:flex-row md:flex-nowrap">
        <PullState state={state} />
        {/* @ts-expect-error - disable because of non-ts component and type mismatch */}
        <A to={{ pageName: 'pullDetail', options: { pullId } }}>
          <span className="mx-6 font-mono text-ds-gray-quinary">#{pullId}</span>
        </A>
        <div className="flex-1">
          <TotalsNumber
            value={head?.totals?.percentCovered}
            plain={plain}
            light={false}
            large={false}
            showChange={false}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-wrap justify-end md:flex-row md:flex-nowrap">
      <PullState state={state} />
      {/* @ts-expect-error - disable because of non-ts component and type mismatch */}
      <A to={{ pageName: 'pullDetail', options: { pullId } }}>
        <span className="mx-6 font-mono text-ds-gray-quinary">#{pullId}</span>
      </A>
      <span className="flex-1 text-right text-sm text-ds-gray-quinary">-</span>
    </div>
  )
}

export default Coverage
