import cs from 'classnames'
import { useState } from 'react'

import SilentNetworkErrorWrapper from 'layouts/shared/SilentNetworkErrorWrapper'
import A from 'ui/A'
import Icon from 'ui/Icon'

import Chart from './Chart'

function ChartToggle() {
  const [isHidden, setIsHidden] = useState(
    localStorage.getItem('is-chart-hidden') === 'true'
  )
  return (
    <div className="mt-2">
      <A
        onClick={() => {
          setIsHidden(!isHidden)
          localStorage.setItem('is-chart-hidden', !isHidden)
        }}
      >
        <Icon
          size="md"
          name={isHidden ? 'chevron-right' : 'chevron-down'}
          variant="solid"
        />
        {isHidden ? 'Show Chart' : 'Hide Chart'}
      </A>
      <div
        className={cs({
          hidden: isHidden,
        })}
      >
        <SilentNetworkErrorWrapper>
          <Chart />
        </SilentNetworkErrorWrapper>
      </div>
    </div>
  )
}

export default ChartToggle
