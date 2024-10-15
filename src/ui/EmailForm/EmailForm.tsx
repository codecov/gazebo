import React, { ChangeEvent, FormEvent, useState } from 'react'

// Define the type for form data
interface FormData {
  name: string
  email: string
}

const FormComponent: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({ name: '', email: '' })

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!formData.name && !formData.email) {
      alert('Form cannot be submitted without name and email!')
      return
    }

    console.log('Form submitted:', formData)

    setFormData({ name: '', email: '' })
  }

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>
          Name:
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
          />
        </label>
      </div>
      <div>
        <label>
          Email:
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />
        </label>
      </div>
      <button type="submit">Submit</button>
    </form>
  )
}

export default FormComponent
