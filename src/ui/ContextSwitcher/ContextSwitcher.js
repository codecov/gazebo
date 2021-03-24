import PropTypes from 'prop-types'
import cs from 'classnames'
import Icon from 'ui/Icon'
import { Menu, MenuList, MenuButton, MenuLink } from '@reach/menu-button'

import './ContextSwitcher.css'
import AppLink from 'shared/AppLink'

const styles = {
  button: 'flex items-center text-xl font-semibold',
  image: 'w-6 h-6 rounded-full',
  imageButton: 'w-6 h-6 border-2 border-ds-gray-secondary rounded-full',
  switchContext: 'px-4 py-2 border-b border-ds-gray-secondary font-semibold',
}

function ContextSwitcher({ currentContext, contexts }) {
  function renderContext(context) {
    const { owner, pageName } = context
    const isActiveContext =
      owner.username.toLowerCase() ===
      currentContext.owner.username.toLowerCase()
    return (
      <MenuLink
        as={AppLink}
        pageName={pageName}
        options={{ owner: owner.username }}
        key={owner.username}
      >
        <img alt="logo" src={owner.avatarUrl} className={styles.image} />
        <div className={cs('mx-2', { 'font-semibold': isActiveContext })}>
          {owner.username}
        </div>
      </MenuLink>
    )
  }

  return (
    <Menu>
      <MenuButton className={styles.button}>
        <img
          alt="logo"
          src={currentContext.owner.avatarUrl}
          className={styles.imageButton}
        />
        <div className="mx-2">{currentContext.owner.username}</div>
        <span aria-hidden="true">
          <Icon variant="solid" name="chevron-down" />
        </span>
      </MenuButton>
      <MenuList>
        <div className={styles.switchContext}>Switch context</div>
        {contexts.map(renderContext)}
      </MenuList>
    </Menu>
  )
}

const contextPropType = PropTypes.shape({
  owner: PropTypes.shape({
    avatarUrl: PropTypes.string.isRequired,
    username: PropTypes.string.isRequired,
  }),
  pageName: PropTypes.string.isRequired,
})

ContextSwitcher.propTypes = {
  currentContext: contextPropType.isRequired,
  contexts: PropTypes.arrayOf(contextPropType).isRequired,
}

export default ContextSwitcher
