import PropTypes from 'prop-types'

import { cn } from 'shared/utils/cn'
import { CopyClipboard } from 'ui/CopyClipboard'

interface TokenWrapperProps {
  token: string
  onClick?: React.ComponentProps<typeof CopyClipboard>['onClick']
  truncate?: boolean
  encodedToken?: string
}

const TokenWrapper = ({
  token,
  onClick,
  truncate = false,
  encodedToken,
}: TokenWrapperProps) => {
  return (
    <div className="flex flex-row gap-1 overflow-auto">
      <pre
        className={cn(
          'h-auto whitespace-pre-line bg-ds-gray-secondary font-mono text-ds-gray-octonary',
          truncate && 'line-clamp-1'
        )}
      >
        {encodedToken ? encodedToken : token}
      </pre>
      <CopyClipboard value={token} onClick={onClick} label="Copy token" />
    </div>
  )
}

TokenWrapper.propTypes = {
  token: PropTypes.string.isRequired,
  onClick: PropTypes.func,
  truncate: PropTypes.bool,
  encodedToken: PropTypes.string,
}

export default TokenWrapper
