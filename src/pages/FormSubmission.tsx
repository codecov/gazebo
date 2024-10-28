interface CustomFormData {
  name: string
  email: string
  phoneNumber: string
}

const handleSubmit = (event: Event): void => {
  event.preventDefault()

  const form = event.target as HTMLFormElement
  const formData: CustomFormData = {
    name: (form.elements.namedItem('name') as HTMLInputElement).value,
    email: (form.elements.namedItem('email') as HTMLInputElement).value,
    phoneNumber: (form.elements.namedItem('phone') as HTMLInputElement).value,
  }

  const errors = validateFormData(formData)

if (errors.length > 0) {
    displayErrors(errors)
  } else {
    submitForm(formData)
    displaySuccessMessage('Form submitted successfully!')
  }
  } catch (error) {
    displayErrorMessage('Failed to submit the form.')
  }
}

const validateFormData = (data: CustomFormData): string[] => {
  const errors: string[] = []

  if (!data.name.trim()) {
    errors.push('Name is required.')
  }

  if (!data.email.trim()) {
    errors.push('Email is required.')
  } else if (!validateEmail(data.email)) {
    errors.push('Email is invalid.')
  }

  return errors
}

const validateEmail = (email: string): boolean => {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailPattern.test(email)
}

const submitForm = (data: CustomFormData): void => {
  console.log('Submitting form:', data)
}

const displayErrors = (errors: string[]): void => {
  console.error('Form errors:', errors)
}

const displaySuccessMessage = (message: string): void => {
  console.log(message)
}

const displayErrorMessage = (message: string): void => {
  console.error(message)
}

const form = document.querySelector('form')
if (form) {
  form.addEventListener('submit', handleSubmit)
}
