import Icon from 'components/Icon'

// Todo add tooltip / link to serve status page
function ServerStatus() {
  // TODO
  const status = 'up'

  const mode = {
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

  return (
    <button className="bg-gray-800 p-1 rounded-full hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white">
      <span className="sr-only">{mode[status].sr}</span>
      <Icon name="serverStatus" color={mode[status].textColor} />
    </button>
  )
}

export default ServerStatus
