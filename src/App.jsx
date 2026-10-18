
import { useState } from 'react'
import {
  login,
  getStudents,
  createStudent,
  deleteStudent,
  updateStudent,
} from './api.js'

function App() {
  const [username, setUsername] = useState('demo-user')
  const [password, setPassword] = useState('')
  const [token, setToken] = useState('')
  const [students, setStudents] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [newStudentName, setNewStudentName] = useState('')
  const [newStudentCourse, setNewStudentCourse] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [deletingStudentId, setDeletingStudentId] = useState(null)
  const [editingStudentId, setEditingStudentId] = useState(null)
  const [editStudentName, setEditStudentName] = useState('')
  const [editStudentCourse, setEditStudentCourse] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)

  const totalStudents = students.length

  const totalCourses = new Set(
    students.map((student) => student.course)
  ).size

  async function handleLogin(event) {
    event.preventDefault()

    setError('')
    setIsLoading(true)

    try {
      const authData = await login(username, password)
      const studentData = await getStudents(authData.accessToken)

      setToken(authData.accessToken)
      setStudents(studentData)
      setPassword('')
    } catch (err) {
      setError(err.message || 'Unable to connect to the API.')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleCreateStudent(event) {
    event.preventDefault()

    setError('')
    setIsCreating(true)

    try {
      const createdStudent = await createStudent(token, {
        name: newStudentName.trim(),
        course: newStudentCourse.trim(),
      })

      setStudents((currentStudents) => [
        ...currentStudents,
        createdStudent,
      ])

      setNewStudentName('')
      setNewStudentCourse('')
    } catch (err) {
      setError(err.message || 'Could not create student.')
    } finally {
      setIsCreating(false)
    }
  }

  async function handleDeleteStudent(studentId) {
  const confirmed = window.confirm(
    'Are you sure you want to delete this student?'
  )

  if (!confirmed) return

  setError('')
  setDeletingStudentId(studentId)

  try {
    await deleteStudent(token, studentId)

    setStudents((currentStudents) =>
      currentStudents.filter((student) => student.id !== studentId)
    )
  } catch (err) {
    setError(err.message || 'Could not delete student.')
  } finally {
    setDeletingStudentId(null)
  }
}

  function handleStartEdit(student) {
  setEditingStudentId(student.id)
  setEditStudentName(student.name)
  setEditStudentCourse(student.course)
  setError('')
}

  function handleCancelEdit() {
  setEditingStudentId(null)
  setEditStudentName('')
  setEditStudentCourse('')
  setError('')
}

  async function handleUpdateStudent(event) {
  event.preventDefault()

  if (editingStudentId === null) return

  setError('')
  setIsUpdating(true)

  try {
    const updatedStudent = await updateStudent(
      token,
      editingStudentId,
      {
        name: editStudentName.trim(),
        course: editStudentCourse.trim(),
      }
    )

    setStudents((currentStudents) =>
      currentStudents.map((student) =>
        student.id === updatedStudent.id
          ? updatedStudent
          : student
      )
    )

    handleCancelEdit()
  } catch (err) {
    setError(err.message || 'Could not update student.')
  } finally {
    setIsUpdating(false)
  }
}

  function handleLogout() {
    setToken('')
    setStudents([])
    setPassword('')
    setError('')
    setNewStudentName('')
    setNewStudentCourse('')
  }

  // Login screen
  if (!token) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
        <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 font-bold text-white">
              SM
            </div>

            <div>
              <h1 className="text-xl font-bold text-slate-900">
                Student Manager
              </h1>
              <p className="text-sm text-slate-500">
                Sign in to your dashboard
              </p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label
                htmlFor="username"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Username
              </label>

              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                placeholder="Enter your username"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Password
              </label>

              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                placeholder="Enter your password"
              />
            </div>

            {error && (
              <p
                role="alert"
                className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-slate-400">
            Student Management API · React + .NET
          </p>
        </section>
      </main>
    )
  }

  // Dashboard after successful login
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 lg:flex">
      <aside className="flex w-full flex-col bg-slate-950 text-white lg:min-h-screen lg:w-64">
        <div className="flex items-center gap-3 border-b border-slate-800 px-6 py-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 font-bold">
            SM
          </div>

          <div>
            <h2 className="font-semibold">Student Manager</h2>
            <p className="text-xs text-slate-400">Administration</p>
          </div>
        </div>

        <nav
          className="flex gap-2 p-4 lg:flex-col"
          aria-label="Main navigation"
        >
          <a
            href="#dashboard"
            className="rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white"
          >
            Dashboard
          </a>

          <a
            href="#students"
            className="rounded-lg px-4 py-3 text-sm text-slate-300 transition hover:bg-slate-800 hover:text-white"
          >
            Students
          </a>
        </nav>

        <div className="mt-auto hidden border-t border-slate-800 px-6 py-5 lg:block">
          <p className="text-sm font-medium">Student Management API</p>
          <p className="mt-1 text-xs text-slate-400">
            React + ASP.NET Core
          </p>
        </div>
      </aside>

      <main
        id="dashboard"
        className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-10"
      >
        <header className="mb-8 flex items-center justify-between gap-4">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-blue-600">
              Overview
            </p>

            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Student Dashboard
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Student records loaded from your .NET API.
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium transition hover:bg-slate-50"
          >
            Sign out
          </button>
        </header>

        {/* Statistics cards */}
        <section
          className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:gap-6"
          aria-label="Student statistics"
        >
          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Total Students
            </p>
            <h2 className="mt-3 text-3xl font-bold">{totalStudents}</h2>
            <span className="text-xs text-slate-500">
              Records in the database
            </span>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Total Courses
            </p>
            <h2 className="mt-3 text-3xl font-bold">{totalCourses}</h2>
            <span className="text-xs text-slate-500">
              Distinct courses represented
            </span>
          </article>
        </section>

        {/* Add Student form */}
        <section className="mb-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-5">
            <h2 className="text-lg font-semibold">Add a Student</h2>
            <p className="mt-1 text-sm text-slate-500">
              Enter the student's details below.
            </p>
          </div>

          <form
            onSubmit={handleCreateStudent}
            className="grid grid-cols-1 gap-5 p-6 md:grid-cols-3 md:items-end"
          >
            <div>
              <label
                htmlFor="newStudentName"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Student Name
              </label>

              <input
                id="newStudentName"
                name="name"
                type="text"
                required
                minLength={2}
                maxLength={101}
                value={newStudentName}
                onChange={(event) =>
                  setNewStudentName(event.target.value)
                }
                placeholder="Enter student name"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label
                htmlFor="newStudentCourse"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Course
              </label>

              <input
                id="newStudentCourse"
                name="course"
                type="text"
                required
                minLength={2}
                maxLength={101}
                value={newStudentCourse}
                onChange={(event) =>
                  setNewStudentCourse(event.target.value)
                }
                placeholder="Enter course"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <button
              type="submit"
              disabled={isCreating}
              className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isCreating ? 'Saving...' : 'Add Student'}
            </button>
          </form>

          {error && (
            <p
              role="alert"
              className="mx-6 mb-6 rounded-lg bg-red-50 p-3 text-sm text-red-700"
            >
              {error}
            </p>
          )}
        </section>

        {/* Student directory */}
        <section
          id="students"
          className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
        >
          <div className="border-b border-slate-200 px-6 py-5">
            <h2 className="text-lg font-semibold">Student Directory</h2>
            <p className="mt-1 text-sm text-slate-500">
              Students retrieved from your backend.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th scope="col" className="px-6 py-4 font-semibold">
                    ID
                  </th>
                  <th scope="col" className="px-6 py-4 font-semibold">
                    Student Name
                  </th>
                  <th scope="col" className="px-6 py-4 font-semibold">
                    Course
                  </th>
                  <th scope="col" className="px-6 py-4 font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>

              
            <tbody className="divide-y divide-slate-100">
                {students.map((student) => (
                <tr key={student.id} className="transition hover:bg-slate-50">
                <td className="whitespace-nowrap px-6 py-5 text-slate-500">
                #{student.id}
                </td>

                  <td className="px-6 py-5 font-medium">
                  {editingStudentId === student.id ? (
                  <input
                    type="text"
                    required
                    minLength={2}
                    maxLength={101}
                    value={editStudentName}
                    onChange={(event) => setEditStudentName(event.target.value)}
                    className="w-full min-w-40 rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    aria-label="Edit student name"
                  />
                  ) : (
                  student.name
                )}
                </td>

                <td className="px-6 py-5">
                {editingStudentId === student.id ? (
                <input
                  type="text"
                  required
                  minLength={2}
                  maxLength={101}
                  value={editStudentCourse}
                  onChange={(event) => setEditStudentCourse(event.target.value)}
                  className="w-full min-w-40 rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  aria-label="Edit student course"
                />
              ) : (
                <span className="whitespace-nowrap rounded-full bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700">
                  {student.course}
                </span>
              )}
            </td>

            <td className="whitespace-nowrap px-6 py-5">
              {editingStudentId === student.id ? (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleUpdateStudent}
                    disabled={isUpdating}
                    className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isUpdating ? 'Saving...' : 'Save'}
                  </button>

                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    disabled={isUpdating}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleStartEdit(student)}
                    className="rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-100"
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteStudent(student.id)}
                    disabled={deletingStudentId === student.id}
                    className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {deletingStudentId === student.id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              )}
            </td>
          </tr>
        ))}

        {students.length === 0 && (
          <tr>
            <td colSpan={4} className="px-6 py-10 text-center text-slate-500">
              No students found in the database.
            </td>
          </tr>
        )}
    </tbody>

            </table>
          </div>

          <div className="border-t border-slate-200 px-6 py-4">
            <p className="text-xs text-slate-500">
              Connected to StudentManagement.Api
            </p>
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
