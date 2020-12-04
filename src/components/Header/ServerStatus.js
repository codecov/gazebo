import Icon from 'components/Icon'
import { useServerStatus } from 'services/status'

export const MODE = {
  unknown: {
    sr: 'Server Unknown',
    textColor: 'text-gray-400',
  },
  up: {
    sr: 'Server Up',
    textColor: 'text-success-700',
  },
  down: {
    sr: 'Server Down',
    textColor: 'text-codecov-red',
  },
  warning: {
    sr: 'Server Issues',
    textColor: 'text-warning-500',
  },
}

// Todo add tooltip
function ServerStatus() {
  const [status] = useServerStatus()

  return (
    <a
      rel="noreferrer"
      target="_blank"
      href="https://status.codecov.io/"
      className="bg-gray-800 p-1 rounded-full hover:gray-500 focus:bg-gray-800"
    >
      <span className="sr-only">{MODE[status].sr}</span>
      <Icon
        testId="server-icon"
        name="serverStatus"
        color={MODE[status].textColor}
      />
    </a>
  )
}

export default ServerStatus
