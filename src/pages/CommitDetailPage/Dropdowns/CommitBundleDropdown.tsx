import SummaryDropdown from 'ui/SummaryDropdown'

import BundleMessage from '../CommitBundleAnalysis/BundleMessage'

const CommitBundleDropdown: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  return (
    <SummaryDropdown.Item value="bundle">
      <SummaryDropdown.Trigger>
        <p className="flex w-full flex-col text-base sm:flex-row sm:gap-1">
          <BundleMessage />
        </p>
      </SummaryDropdown.Trigger>
      <SummaryDropdown.Content className="py-2">
        {children}
      </SummaryDropdown.Content>
    </SummaryDropdown.Item>
  )
}

export default CommitBundleDropdown
