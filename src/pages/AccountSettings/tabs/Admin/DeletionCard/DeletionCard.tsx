import Card from 'old_ui/Card'
import A from 'ui/A'

interface EraseSectionProps {
  isPersonalSettings: boolean
}

function EraseSection({ isPersonalSettings }: EraseSectionProps) {
  if (isPersonalSettings) {
    return (
      <p>
        Erase all my personal content and projects.{' '}
        <A to={{ pageName: 'support' }} hook="contact-support-link" isExternal>
          Contact support
        </A>
      </p>
    )
  }

  return (
    <p>
      Erase all my organization content and projects.{' '}
      <A to={{ pageName: 'support' }} hook="contact-support-link" isExternal>
        Contact support
      </A>
    </p>
  )
}

interface DeletionCardProps {
  isPersonalSettings: boolean
}

function DeletionCard({ isPersonalSettings }: DeletionCardProps) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold">Delete account</h2>
      <Card>
        <EraseSection isPersonalSettings={isPersonalSettings} />
      </Card>
    </div>
  )
}

export default DeletionCard
