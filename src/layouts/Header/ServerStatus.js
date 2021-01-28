import { useServerStatus } from 'services/status'

import { ReactComponent as Server } from './server.svg'

const iconColor = {
  unknown: 'text-gray-400',
  none: 'text-success-700', // Aka server status up
  critical: 'text-codecov-red',
  major: 'text-codecov-red',
  minor: 'text-warning-500',
}

const defaultStatus = {
  description: 'All Systems Operational',
  indicator: 'none',
}

// Todo add tooltip
function ServerStatus() {
  const { data, isError, isSuccess, isLoading } = useServerStatus({
    initialData: defaultStatus,
  })

  return (
    <a
      rel="noreferrer"
      target="_blank"
      href="https://status.codecov.io/"
      className="bg-gray-800 p-1 rounded-full hover:gray-500 focus:bg-gray-800"
    >
      {isError && (
        <>
          <span className="sr-only">Status Unknown</span>
          <Server data-testid="server-icon" className={iconColor['unknown']} />
        </>
      )}
      {isSuccess && (
        <>
          <span className="sr-only">{data.description}</span>
          <Server
            data-testid="server-icon"
            className={iconColor[data.indicator]}
          />
        </>
      )}
      {isLoading && (
        <>
          <span className="sr-only">{defaultStatus.description}</span>
          <Server
            data-testid="server-icon"
            className={iconColor[defaultStatus.indicator]}
          />
        </>
      )}
    </a>
  )
}

export default ServerStatus
