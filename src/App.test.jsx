
import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
} from 'vitest'

import {
  render,
  screen,
  cleanup,
  waitFor,
} from '@testing-library/react'

import userEvent from '@testing-library/user-event'
import App from './App.jsx'

import {
  login,
  getStudents,
  createStudent,
  deleteStudent,
  updateStudent,
} from './api.js'

// Mock the API so these tests don't need the real backend.
vi.mock('./api.js', () => ({
  login: vi.fn(),
  getStudents: vi.fn(),
  createStudent: vi.fn(),
  deleteStudent: vi.fn(),
  updateStudent: vi.fn(),
}))

// Remove rendered components and restore spies after each test.
afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

// Reset API mock implementations before every test.
beforeEach(() => {
  vi.resetAllMocks()
})

describe('App login screen', () => {
  it('renders the username, password, and sign-in button', () => {
    render(<App />)

    expect(
      screen.getByRole('heading', {
        name: /student manager/i,
      })
    ).toBeInTheDocument()

    expect(
      screen.getByLabelText(/username/i)
    ).toBeInTheDocument()

    expect(
      screen.getByLabelText(/password/i)
    ).toBeInTheDocument()

    expect(
      screen.getByRole('button', {
        name: /sign in/i,
      })
    ).toBeInTheDocument()
  })

  it('loads and displays students after successful login', async () => {
    const user = userEvent.setup()

    login.mockResolvedValueOnce({
      accessToken: 'fake-test-token',
    })

    getStudents.mockResolvedValueOnce([
      {
        id: 1,
        name: 'Ada Okafor',
        course: 'Computer Science',
      },
    ])

    render(<App />)

    await user.type(
      screen.getByLabelText(/password/i),
      'test-password'
    )

    await user.click(
      screen.getByRole('button', {
        name: /sign in/i,
      })
    )

    expect(
      await screen.findByRole('heading', {
        name: /student dashboard/i,
      })
    ).toBeInTheDocument()

    expect(
      screen.getByText('Ada Okafor')
    ).toBeInTheDocument()

    expect(
      screen.getByText('Computer Science')
    ).toBeInTheDocument()

    expect(login).toHaveBeenCalledWith(
      'demo-user',
      'test-password'
    )

    expect(getStudents).toHaveBeenCalledWith(
      'fake-test-token'
    )
  })

  it('displays an error when login fails', async () => {
    const user = userEvent.setup()

    login.mockRejectedValueOnce(
      new Error('Invalid username or password.')
    )

    render(<App />)

    await user.type(
      screen.getByLabelText(/password/i),
      'wrong-password'
    )

    await user.click(
      screen.getByRole('button', {
        name: /sign in/i,
      })
    )

    expect(
      await screen.findByRole('alert')
    ).toHaveTextContent(
      'Invalid username or password.'
    )

    expect(getStudents).not.toHaveBeenCalled()

    expect(
      screen.queryByRole('heading', {
        name: /student dashboard/i,
      })
    ).not.toBeInTheDocument()
  })

  it('creates a student and displays the new record', async () => {
    const user = userEvent.setup()

    login.mockResolvedValueOnce({
      accessToken: 'fake-test-token',
    })

    getStudents.mockResolvedValueOnce([])

    createStudent.mockResolvedValueOnce({
      id: 10,
      name: 'Jonah Doe',
      course: 'Software Engineering',
    })

    render(<App />)

    // Sign in.
    await user.type(
      screen.getByLabelText(/password/i),
      'test-password'
    )

    await user.click(
      screen.getByRole('button', {
        name: /sign in/i,
      })
    )

    // Wait for the dashboard.
    expect(
      await screen.findByRole('heading', {
        name: /student dashboard/i,
      })
    ).toBeInTheDocument()

    // Fill in the Add Student form.
    await user.type(
      screen.getByRole('textbox', {
        name: /student name/i,
      }),
      'Jonah Doe'
    )

    await user.type(
      screen.getByRole('textbox', {
        name: /^course$/i,
      }),
      'Software Engineering'
    )

    await user.click(
      screen.getByRole('button', {
        name: /add student/i,
      })
    )

    // Verify the new student appears.
    expect(
      await screen.findByText('Jonah Doe')
    ).toBeInTheDocument()

    expect(
      screen.getByText('Software Engineering')
    ).toBeInTheDocument()

    expect(createStudent).toHaveBeenCalledWith(
      'fake-test-token',
      {
        name: 'Jonah Doe',
        course: 'Software Engineering',
      }
    )
  })

  it('deletes a student after confirmation', async () => {
    const user = userEvent.setup()

    login.mockResolvedValueOnce({
      accessToken: 'fake-test-token',
    })

    getStudents.mockResolvedValueOnce([
      {
        id: 7,
        name: 'Ada Okafor',
        course: 'Computer Science',
      },
    ])

    deleteStudent.mockResolvedValueOnce()

    const confirmSpy = vi
      .spyOn(window, 'confirm')
      .mockReturnValue(true)

    render(<App />)

    // Sign in.
    await user.type(
      screen.getByLabelText(/password/i),
      'test-password'
    )

    await user.click(
      screen.getByRole('button', {
        name: /sign in/i,
      })
    )

    // Confirm that the student appears.
    expect(
      await screen.findByText('Ada Okafor')
    ).toBeInTheDocument()

    // Click Delete and confirm.
    await user.click(
      screen.getByRole('button', {
        name: /^delete$/i,
      })
    )

    expect(confirmSpy).toHaveBeenCalled()

    expect(deleteStudent).toHaveBeenCalledWith(
      'fake-test-token',
      7
    )

    // The student should disappear after deletion succeeds.
    await waitFor(() => {
      expect(
        screen.queryByText('Ada Okafor')
      ).not.toBeInTheDocument()
    })
  })

  it('updates a student and displays the updated record', async () => {
    const user = userEvent.setup()

    login.mockResolvedValueOnce({
      accessToken: 'fake-test-token',
    })

    getStudents.mockResolvedValueOnce([
      {
        id: 7,
        name: 'Ada Okafor',
        course: 'Computer Science',
      },
    ])

    updateStudent.mockResolvedValueOnce({
      id: 7,
      name: 'Jane Doe',
      course: 'Physics',
    })

    render(<App />)

    // Sign in.
    await user.type(
      screen.getByLabelText(/password/i),
      'test-password'
    )

    await user.click(
      screen.getByRole('button', {
        name: /sign in/i,
      })
    )

    // Confirm the original student appears.
    expect(
      await screen.findByText('Ada Okafor')
    ).toBeInTheDocument()

    // Start editing.
    await user.click(
      screen.getByRole('button', {
        name: /^edit$/i,
      })
    )

    // Change the student's name.
    const nameInput = screen.getByRole('textbox', {
      name: /edit student name/i,
    })

    await user.clear(nameInput)
    await user.type(nameInput, 'Jane Doe')

    // Change the student's course.
    const courseInput = screen.getByRole('textbox', {
      name: /edit student course/i,
    })

    await user.clear(courseInput)
    await user.type(courseInput, 'Physics')

    // Save the changes.
    await user.click(
      screen.getByRole('button', {
        name: /^save$/i,
      })
    )

    // Verify the API received the correct ID and data.
    expect(updateStudent).toHaveBeenCalledWith(
      'fake-test-token',
      7,
      {
        name: 'Jane Doe',
        course: 'Physics',
      }
    )

    // Verify the updated record appears.
    expect(
      await screen.findByText('Jane Doe')
    ).toBeInTheDocument()

    expect(
      screen.getByText('Physics')
    ).toBeInTheDocument()
  })
})
