import cs from 'classnames'
import { useState } from 'react'

import { useTruncation } from './hooks'

const TruncateStates = {
  EXPAND: 'see more',
  COLLAPSE: 'see less',
} as const

const TruncatedMessage: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [label, setLabel] = useState<string>(TruncateStates.EXPAND)
  const { ref, canTruncate } = useTruncation()

  return (
    <div className="inline-flex items-end">
      <pre
        ref={ref}
        data-testid="truncate-message-pre"
        className={cs(
          'text-xl font-semibold break-all whitespace-pre-wrap font-sans w-fit',
          {
            'line-clamp-1': label === TruncateStates.EXPAND,
          }
        )}
      >
        {children}
      </pre>

      {canTruncate && (
        <button
          className="text-ds-blue-default hover:underline"
          onClick={() =>
            setLabel(
              label === TruncateStates.EXPAND
                ? TruncateStates.COLLAPSE
                : TruncateStates.EXPAND
            )
          }
        >
          {label}
        </button>
      )}
    </div>
  )
}

export default TruncatedMessage
