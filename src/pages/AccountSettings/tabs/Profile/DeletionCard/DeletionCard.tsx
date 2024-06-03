import Card from 'old_ui/Card'
import A from 'ui/A'

function DeletionCard() {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold">Delete account</h2>
      <Card>
        <p>
          Erase all my personal content and projects.{' '}
          <A
            to={{ pageName: 'support' }}
            hook="contact-support-link"
            isExternal
          >
            Contact support
          </A>
        </p>
      </Card>
    </div>
  )
}

export default DeletionCard
