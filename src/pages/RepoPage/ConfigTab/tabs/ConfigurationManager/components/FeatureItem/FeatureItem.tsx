import A from 'ui/A'
import Icon from 'ui/Icon'

interface FeatureItemProps extends React.PropsWithChildren {
  name: string
  configured?: boolean
  docsLink?: string // navLink key
  getStartedLink?: string // navLink key
  hiddenStatus?: boolean
  nameLink?: string // navLink key
}

function FeatureItem({
  name,
  configured,
  docsLink,
  getStartedLink,
  hiddenStatus,
  nameLink,
  children,
}: FeatureItemProps) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex-1">
        {nameLink ? (
          <A
            to={{ pageName: nameLink }}
            hook="configuration-name-link"
            isExternal={true}
            variant="medium"
          >
            {name}
          </A>
        ) : (
          <h4 className="font-semibold">{name}</h4>
        )}
        <span className="pr-1">{children}</span>
        {docsLink ? (
          <A
            to={{ pageName: docsLink }}
            hook="configuration-docs"
            isExternal={false}
            showExternalIcon={false}
            variant="medium"
          >
            <span className="flex h-full items-center text-xs leading-[18px]">
              docs
              <Icon
                className="left-0 [&_path]:stroke-[3px]"
                name="documentText"
                size="sm"
              />
            </span>
          </A>
        ) : null}
      </div>
      {hiddenStatus ? null : (
        <ConfiguredStatus
          configured={configured}
          getStartedLink={getStartedLink}
        />
      )}
    </div>
  )
}

interface ConfiguredStatusProps {
  configured?: boolean
  getStartedLink?: string
}

const ConfiguredStatus = ({
  configured = false,
  getStartedLink,
}: ConfiguredStatusProps) => {
  if (configured) {
    return (
      <ul className="list-disc font-medium text-ds-primary-green">
        <li>Configured</li>
      </ul>
    )
  }

  if (getStartedLink) {
    return (
      <A
        to={{ pageName: getStartedLink }}
        hook="configuration-get-started"
        isExternal={false}
        showExternalIcon={false}
        data-testid="FeatureItem-get-started"
      >
        <span className="font-medium">Get Started</span>
      </A>
    )
  }

  return null
}

export default FeatureItem
