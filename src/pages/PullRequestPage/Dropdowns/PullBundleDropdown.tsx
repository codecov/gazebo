import SummaryDropdown from 'ui/SummaryDropdown'

import BundleMessage from '../PullBundleAnalysis/BundleMessage'

const PullBundleDropdown: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  return (
    <SummaryDropdown.Item value="bundle-analysis">
      <SummaryDropdown.Trigger>
        <p className="flex w-full flex-col sm:flex-row sm:gap-1">
          <BundleMessage />
        </p>
      </SummaryDropdown.Trigger>
      <SummaryDropdown.Content className="py-2">
        {children}
      </SummaryDropdown.Content>
    </SummaryDropdown.Item>
  )
}

export default PullBundleDropdown
