import PropType from 'prop-types'
import { JSXElementConstructor, Key, ReactElement, ReactNode } from 'react'

import Icon from 'old_ui/Icon'

function BenefitList({ benefits, iconName, iconColor }) {
  return (
    <ul className="flex flex-col gap-3">
      {benefits?.map(
        (
          benefit:
            | boolean
            | ReactElement<any, string | JSXElementConstructor<any>>
            | Iterable<ReactNode>
            | Key
            | null
            | undefined
        ) => (
          <li key={benefit} className="flex items-center gap-1">
            {/* // TODO: Figure a way to create custom icons w/ new icon component */}
            <Icon name={iconName} color={iconColor} />
            {benefit}
          </li>
        )
      )}
    </ul>
  )
}

BenefitList.propTypes = {
  benefits: PropType.arrayOf(PropType.string).isRequired,
  iconName: PropType.string.isRequired,
  iconColor: PropType.string,
}

export default BenefitList
