import { useFlags } from 'shared/featureFlags'
import A from 'ui/A'

const PendoLink: React.FC = () => {
  const { pendoModalPrPage } = useFlags({ pendoModalPrPage: false })

  if (!pendoModalPrPage) {
    return null
  }

  return (
    <div className="flex items-end">
      {/* Need this rule here as the href will be handled by pendo */}
      {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
      {/* @ts-expect-error */}
      <A
        id="pendo-modal-anchor-link"
        hook="pendo-pr-page"
        href=""
        variant="black"
      >
        Does this report look accurate?
      </A>
    </div>
  )
}

export default PendoLink
