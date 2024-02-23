import SummaryDropdown from 'ui/SummaryDropdown'

import BundleMessage from '../PullBundleAnalysis/BundleMessage'

const PullBundleDropdown: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  return (
    <SummaryDropdown.Item value="bundle-analysis">
      <SummaryDropdown.Trigger>
        <BundleMessage />
      </SummaryDropdown.Trigger>
      <SummaryDropdown.Content className="py-2">
        {children}
      </SummaryDropdown.Content>
    </SummaryDropdown.Item>
  )
}

export default PullBundleDropdown
