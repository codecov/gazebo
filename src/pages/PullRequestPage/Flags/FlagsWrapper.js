import Flags from './Flags'
import FlagsErrorBoundary from './FlagsErrorBoundary'

function FlagsWrapper() {
  return (
    <FlagsErrorBoundary>
      <Flags />
    </FlagsErrorBoundary>
  )
}

export default FlagsWrapper
