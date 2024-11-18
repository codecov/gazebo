import Icon from 'old_ui/Icon'

function BenefitList({
  benefits,
  iconName,
  iconColor,
}: {
  benefits?: string[]
  iconName: string
  iconColor?: string
}) {
  return (
    <ul className="flex flex-col gap-3">
      {benefits?.map((benefit) => (
        <li key={benefit} className="flex items-center gap-1">
          {/* // TODO: Figure a way to create custom icons w/ new icon component */}
          <Icon name={iconName} color={iconColor} />
          {benefit}
        </li>
      ))}
    </ul>
  )
}

export default BenefitList
