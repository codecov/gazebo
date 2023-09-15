import { useNavLinks } from 'services/navigation'
import { providerImage, providerToName } from 'shared/utils/provider'

interface SyncButtonProps {
  provider: 'gh' | 'gl' | 'bb'
}

const SyncButton: React.FC<SyncButtonProps> = ({ provider }) => {
  const { signIn } = useNavLinks()
  const to = `${window.location.protocol}//${window.location.host}/${provider}`

  return (
    <div className="flex h-14 items-center rounded-sm border border-ds-gray-quaternary bg-ds-gray-primary text-left shadow">
      <a
        className="flex h-full grow items-center font-semibold hover:bg-ds-gray-secondary"
        href={signIn.path({ to, provider })}
        data-cy={'login-button'}
      >
        <img
          alt={`Logo of ${providerToName(provider)}`}
          className="mx-4 block h-6 w-6"
          src={providerImage(provider)}
        />
        Sync with {providerToName(provider)}
      </a>
    </div>
  )
}

export default SyncButton
