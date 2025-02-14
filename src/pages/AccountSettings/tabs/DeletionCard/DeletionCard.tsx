import Card from 'old_ui/Card'
import A from 'ui/A'

interface DeletionCardProps {
  isPersonalSettings: boolean
}

function DeletionCard({ isPersonalSettings }: DeletionCardProps) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold">
        {isPersonalSettings ? 'Delete account' : 'Delete organization'}
      </h2>
      <Card>
        <p>
          {isPersonalSettings
            ? 'Erase my personal account and all my repositories. '
            : 'Erase organization and all its repositories. '}
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
