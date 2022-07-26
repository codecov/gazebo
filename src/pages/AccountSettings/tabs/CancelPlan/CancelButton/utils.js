import { format, fromUnixTime } from 'date-fns'

export function getEndPeriod(unixPeriodEnd) {
  return (
    unixPeriodEnd &&
    format(fromUnixTime(unixPeriodEnd), 'MMMM do yyyy, h:m aaaa')
  )
}

export function loadBaremetrics() {
  return new Promise((resolve) => {
    console.log('hello here')
    if (window.barecancel && window.barecancel.created) return resolve()
    // Might not be needed
    window.barecancel = { created: true }

    const script = document.createElement('script')
    script.src =
      'https://baremetrics-barecancel.baremetrics.com/js/application.js'
    script.async = true
    script.dataset.testid = 'baremetrics-script'
    // Next 2 Might not be needed, instead document.body.appendChild(script)
    const createdScript = document.getElementsByTagName('script')[0]
    createdScript.parentNode.insertBefore(script, createdScript)
    script.onload = () => {
      window.barecancel.created = true
      resolve()
    }
  })
}

export function cleanupBaremetrics() {
  const scriptElement = document.querySelector(
    '[data-testid="baremetrics-script"]'
  )
  // test this
  const stylesElement = document.querySelector(
    '[href="https://baremetrics-barecancel.baremetrics.com/css/barecancel.css"]' // Hacky but they auto add this style block with no identifier
  )

  if (!!scriptElement) {
    scriptElement.parentNode.removeChild(scriptElement)
    delete window.barecancel
  }

  if (!!stylesElement) {
    stylesElement.parentNode.removeChild(stylesElement)
  }
}
