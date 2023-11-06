import Summary from 'ui/Summary'

const fields = [
  {
    name: 'head',
    title: (
      <>
        <span>HEAD</span>
        <div className="w-4" />
      </>
    ),
    value: (
      <div className="h-6">
        <div className="h-4 w-20 animate-pulse rounded-full bg-ds-gray-tertiary" />
      </div>
    ),
  },
  {
    name: 'patch',
    title: 'Patch',
    value: (
      <div className="h-6">
        <div className="h-4 w-20 animate-pulse rounded-full bg-ds-gray-tertiary" />
      </div>
    ),
  },
  {
    name: 'change',
    title: 'Change',
    value: (
      <div className="h-6">
        <div className="h-4 w-20 animate-pulse rounded-full bg-ds-gray-tertiary" />
      </div>
    ),
  },
]

function CompareSummarySkeleton() {
  return (
    <div className="border-b border-ds-gray-secondary pb-4">
      <Summary fields={fields} />
    </div>
  )
}

export default CompareSummarySkeleton
