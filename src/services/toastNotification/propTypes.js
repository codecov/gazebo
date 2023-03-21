import PropType from 'prop-types'

export const notificationPropType = PropType.shape({
  text: PropType.oneOfType([PropType.string, PropType.element]).isRequired,
  id: PropType.number.isRequired,
  disappearAfter: PropType.number.isRequired,
  type: PropType.string.isRequired,
})
