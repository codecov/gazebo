import A from 'ui/A'
import Icon from 'ui/Icon'

interface FeatureItemProps extends React.PropsWithChildren {
  name: string
  configured?: boolean
  docsLink?: string // navLink key
  getStartedLink: string // navLink key
  hiddenStatus?: boolean
}

function FeatureItem({
  name,
  configured,
  docsLink,
  hiddenStatus,
  getStartedLink,
  children,
}: FeatureItemProps) {
  return (
    <div>
      <div className="flex items-center">
        <div className="flex-1">
          <h5 className="font-semibold">{name}</h5>
          <span className="flex items-end gap-1">
            {children}
            {docsLink ? (
              <A
                to={{ pageName: docsLink }}
                hook="configuration-docs"
                isExternal={false}
                showExternalIcon={false}
                variant="medium"
              >
                <span className="flex items-center text-xs leading-[18px]">
                  docs
                  <Icon
                    className="left-0 [&_path]:stroke-[3px]"
                    name="documentText"
                    size="sm"
                  />
                </span>
              </A>
            ) : null}
          </span>
        </div>
        {hiddenStatus ? null : (
          <ConfiguredStatus
            configured={configured}
            getStartedLink={getStartedLink}
          />
        )}
      </div>
    </div>
  )
}

interface ConfiguredStatusProps {
  configured?: boolean
  getStartedLink: string
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
  return (
    <span className="flex items-baseline gap-1 font-medium">
      <p className="text-ds-gray-quinary">not enabled</p>
      <A
        to={{ pageName: getStartedLink }}
        hook="configuration-get-started"
        isExternal={false}
        showExternalIcon={false}
      >
        <p className="text-xs leading-4">get started</p>
      </A>
    </span>
  )
}

export default FeatureItem
