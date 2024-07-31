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
    <div className="flex items-center">
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
        <div className="flex items-end gap-1">
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
        </div>
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
  return (
    <p className="flex items-baseline gap-1 font-medium">
      <span className="text-ds-gray-quinary">not enabled</span>
      {getStartedLink ? (
        <A
          to={{ pageName: getStartedLink }}
          hook="configuration-get-started"
          isExternal={false}
          showExternalIcon={false}
        >
          <span className="text-xs leading-4">get started</span>
        </A>
      ) : null}
    </p>
  )
}

export default FeatureItem
