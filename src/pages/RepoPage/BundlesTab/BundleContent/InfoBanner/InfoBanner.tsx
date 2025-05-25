import Banner from 'ui/Banner'

const NoSelectedBranchContent: React.FC = () => {
  return (
    <>
      <h1 className="font-semibold">No Branch Selected</h1>
      <p className="flex gap-1">
        Please select a branch to view the list of bundles.
      </p>
    </>
  )
}

const NoSelectedBundleContent: React.FC = () => {
  return (
    <>
      <h1 className="font-semibold">No Bundle Selected</h1>
      <p className="flex gap-1">
        Please select a bundle to view the detailed bundle breakdown.
      </p>
    </>
  )
}

interface InfoBannerProps {
  branch: string | null
  bundle?: string
}

const InfoBanner: React.FC<InfoBannerProps> = ({ branch, bundle }) => {
  const Component = branch ? NoSelectedBundleContent : NoSelectedBranchContent

  if (!branch || !bundle) {
    return (
      <Banner>
        <div className="flex flex-col gap-4 text-sm">
          <Component />
        </div>
      </Banner>
    )
  }

  return null
}

export default InfoBanner
