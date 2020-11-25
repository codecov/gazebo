import PropType from 'prop-types'

export const notificationPropType = PropType.shape({
  text: PropType.string.isRequired,
  id: PropType.number.isRequired,
  disappearAfter: PropType.number.isRequired,
  type: PropType.string.isRequired,
})
