import PropTypes from 'prop-types'

function SettingsDescriptor({ title, description, content }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <div className="text-lg font-semibold">{title}</div>
        <p>{description}</p>
        <hr />
      </div>
      <div className="flex flex-col border-2 border-ds-gray-primary p-4 xl:w-4/5 2xl:w-3/5 gap-4">
        {content}
      </div>
    </div>
  )
}

SettingsDescriptor.propTypes = {
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.element]).isRequired,
  description: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  content: PropTypes.oneOfType([PropTypes.string, PropTypes.element])
    .isRequired,
}

export default SettingsDescriptor
