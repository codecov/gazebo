import Progress from 'ui/Progress'
import { progressColors, progressVariants } from 'ui/Progress/Progress'

const CoverageProgress = ({
  amount,
  color = 'primary',
  variant = 'default',
}: {
  amount?: number | null
  color?: keyof typeof progressColors
  variant?: keyof typeof progressVariants
}) => {
  if (typeof amount === 'number') {
    return <Progress amount={amount} color={color} variant={variant} label />
  }

  return <p className="text-sm text-ds-gray-quinary">No report uploaded yet</p>
}

export default CoverageProgress
