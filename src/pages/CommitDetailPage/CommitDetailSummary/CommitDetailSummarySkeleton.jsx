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
      <div className="h-6 mt-1 pt-0.5">
        <div className="animate-pulse bg-ds-gray-tertiary rounded-full h-4 w-20" />
      </div>
    ),
  },
  {
    name: 'patch',
    title: 'Patch',
    value: (
      <div className="h-6 mt-1 pt-0.5">
        <div className="animate-pulse bg-ds-gray-tertiary rounded-full h-4 w-20" />
      </div>
    ),
  },
  {
    name: 'change',
    title: 'Change',
    value: (
      <div className="h-6 mt-1 pt-0.5">
        <div className="animate-pulse bg-ds-gray-tertiary rounded-full h-4 w-20" />
      </div>
    ),
  },
  {
    name: 'source',
    title: 'Source',
    value: (
      <div className="h-6 mt-1 pt-0.5">
        <div className="animate-pulse bg-ds-gray-tertiary rounded-full h-4 w-32" />
      </div>
    ),
  },
]

function CommitDetailSummarySkeleton() {
  return (
    <div className="border-b border-ds-gray-secondary pb-4">
      <Summary fields={fields} />
    </div>
  )
}

export default CommitDetailSummarySkeleton
