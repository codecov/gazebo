import cs from 'classnames'

import config from 'config'

import A from 'ui/A'

import img404 from './assets/error-404.svg'
import styles from './NotFound.module.css'

const NotFoundErrorMessage = () => {
  const { origin } = window.location

  const href = config.IS_SELF_HOSTED ? origin : 'https://app.codecov.io/'

  if (config.IS_SELF_HOSTED) {
    return (
      <p className="my-4 px-3 sm:px-0">
        You may be able to locate this content by browsing for it from{' '}
        <A
          rel="noreferrer"
          className="text-ds-blue-default"
          href={href}
          target="_blank"
          hook="home"
        >
          the home page.
        </A>
      </p>
    )
  }

  return (
    <p className="my-4 px-3 sm:px-0">
      You may be able to locate the content by visiting{' '}
      <A
        rel="noreferrer"
        className="text-ds-blue-default"
        href={href}
        isExternal={true}
        hook="home"
      >
        Codecov’s home page
      </A>{' '}
      and browsing to it.
    </p>
  )
}

const NotFound = () => {
  const { illustration, title } = {
    illustration: img404,
    title: 'Not found',
  }

  return (
    <article className="mx-auto flex h-full flex-col items-center justify-center">
      <img
        alt="illustration error"
        className={cs(styles.illustrationError, 'mx-auto')}
        src={illustration}
      />
      <h1 className="mt-6 text-2xl">{title}</h1>
      <NotFoundErrorMessage />
      <p>
        <strong>Error 404</strong>
      </p>
    </article>
  )
}

export default NotFound
