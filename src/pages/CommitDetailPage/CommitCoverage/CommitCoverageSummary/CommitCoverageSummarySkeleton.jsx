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
      <div className="mt-1 h-6 pt-0.5">
        <div className="h-4 w-20 animate-pulse rounded-full bg-ds-gray-tertiary" />
      </div>
    ),
  },
  {
    name: 'patch',
    title: 'Patch',
    value: (
      <div className="mt-1 h-6 pt-0.5">
        <div className="h-4 w-20 animate-pulse rounded-full bg-ds-gray-tertiary" />
      </div>
    ),
  },
  {
    name: 'change',
    title: 'Change',
    value: (
      <div className="mt-1 h-6 pt-0.5">
        <div className="h-4 w-20 animate-pulse rounded-full bg-ds-gray-tertiary" />
      </div>
    ),
  },
  {
    name: 'source',
    title: 'Source',
    value: (
      <div className="mt-1 h-6 pt-0.5">
        <div className="h-4 w-32 animate-pulse rounded-full bg-ds-gray-tertiary" />
      </div>
    ),
  },
]

function CommitCoverageSummarySkeleton() {
  return (
    <div className="border-b border-ds-gray-secondary pb-4">
      <Summary fields={fields} />
    </div>
  )
}

export default CommitCoverageSummarySkeleton
