import PropType from 'prop-types'

import Icon from 'old_ui/Icon'

function BenefitList({ benefits, iconName, iconColor }) {
  const iconClassName = `bg-gray-200 rounded-full list-item-type mr-3`
  return (
    <ul>
      {benefits.map((benefit) => (
        <li
          key={benefit}
          className="flex items-center mb-5 text-gray-500 last:mb-0"
        >
          <div className={iconClassName}>
            <Icon name={iconName} color={iconColor} />
          </div>
          {benefit}
        </li>
      ))}
    </ul>
  )
}

BenefitList.propTypes = {
  benefits: PropType.arrayOf(PropType.string).isRequired,
  iconName: PropType.string.isRequired,
  iconColor: PropType.string,
}

export default BenefitList
