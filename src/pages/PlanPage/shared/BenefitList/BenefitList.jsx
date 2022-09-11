import PropType from 'prop-types'

import Icon from 'old_ui/Icon'


function BenefitList({ benefits, iconName, iconColor }) {
  const iconClassName = `bg-ds-gray-secondary rounded-full list-item-type`
  return (
    <ul className="flex flex-col gap-5">
      {benefits?.map((benefit) => (
        <li
          key={benefit}
          className="flex items-center gap-2 text-ds-gray-quinary last:mb-0"
        >
          {/* // TODO: Figure a way to create custom icons w/ new icon component */}
          <Icon name={iconName} color={iconColor} className={iconClassName} />
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
