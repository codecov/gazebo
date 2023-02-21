import PropTypes from 'prop-types'

function SettingsDescriptor({ title, description, content }) {
  return (
    <div className="mx-4 flex flex-col gap-4 sm:mx-0">
      <div className="flex flex-col gap-2">
        <div className="text-lg font-semibold">{title}</div>
        <p>{description}</p>
        <hr />
      </div>
      <div className="flex flex-col gap-2 border-2 border-ds-gray-primary p-4 xl:w-4/5 2xl:w-3/5">
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
