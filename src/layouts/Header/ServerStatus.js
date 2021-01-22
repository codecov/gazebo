import { useState } from 'react'
import { useEffect } from 'react'
import { useServerStatus } from 'services/status'

import { ReactComponent as Server } from './server.svg'

const ui = {
  unknown: {
    screenReader: 'Server Status Unknown',
    textColor: 'text-gray-400',
  },
  none: {
    screenReader: 'Server Up',
    textColor: 'text-success-700',
  },
  critical: {
    screenReader: 'Server Down',
    textColor: 'text-codecov-red',
  },
  major: {
    screenReader: 'Major Server Issues',
    textColor: 'text-codecov-red',
  },
  minor: {
    screenReader: 'Minor Server Issues',
    textColor: 'text-warning-500',
  },
}

// Todo add tooltip
function ServerStatus() {
  const { isSuccess, data } = useServerStatus()
  const [status, setStatus] = useState(ui.unknown)

  useEffect(() => {
    if (isSuccess) {
      setStatus(ui[data.status.indicator])
    }
  }, [isSuccess, data])

  return (
    <a
      rel="noreferrer"
      target="_blank"
      href="https://status.codecov.io/"
      className="bg-gray-800 p-1 rounded-full hover:gray-500 focus:bg-gray-800"
    >
      <span className="sr-only">{status.screenReader}</span>
      <Server data-testid="server-icon" className={status.textColor} />
    </a>
  )
}

export default ServerStatus
