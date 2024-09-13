import { format, fromUnixTime } from 'date-fns'

export function getEndPeriod(unixPeriodEnd) {
  return (
    unixPeriodEnd &&
    format(fromUnixTime(unixPeriodEnd), 'MMMM do yyyy, h:m aaaa')
  )
}

export function loadBaremetrics() {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src =
      'https://baremetrics-barecancel.baremetrics.com/js/application.js'
    script.dataset.testid = 'baremetrics-script'

    // These functions control the logic in useBareCancel to make sure if the script isn't loaded to cancel without Baremetrics
    script.onload = function () {
      return resolve()
    }

    script.onerror = function () {
      return reject()
    }

    document.body.appendChild(script)
  })
}

export function cleanupBaremetrics() {
  const scriptElement = document.querySelector(
    '[data-testid="baremetrics-script"]'
  )

  const stylesElement = document.querySelector(
    '[href="https://baremetrics-barecancel.baremetrics.com/css/barecancel.css"]'
  )

  if (!!scriptElement) {
    scriptElement.parentNode.removeChild(scriptElement)
    delete window.barecancel
  }

  if (!!stylesElement) {
    stylesElement.parentNode.removeChild(stylesElement)
  }
}
