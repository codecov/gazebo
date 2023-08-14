import A from 'ui/A'

const PendoLink: React.FC = () => {
  return (
    <div className="flex items-end">
      {/* Need this rule here as the href will be handled by pendo */}
      {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
      {/* This ts expect error is required because of weird types on the A */}
      {/* @ts-expect-error */}
      <A
        id="pendo-modal-anchor-link"
        hook="pendo-pr-page"
        href="#"
        variant="black"
      >
        Does this report look accurate?
      </A>
    </div>
  )
}

export default PendoLink
