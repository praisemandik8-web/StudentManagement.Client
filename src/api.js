
const API_BASE_URL = 'http://localhost:5004'

export async function login(username, password) {
  const response = await fetch(`${API_BASE_URL}/api/auth/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  })

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Invalid username or password.')
    }

    throw new Error(`Login failed (${response.status}).`)
  }

  return response.json()
}

export async function getStudents(token) {
  const response = await fetch(`${API_BASE_URL}/api/students`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Authentication failed. Please sign in again.')
    }

    throw new Error(`Could not load students (${response.status}).`)
  }

  return response.json()
}


export async function createStudent(token, studentData) {
  const response = await fetch(`${API_BASE_URL}/api/students`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(studentData),
  })

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Authentication failed. Please sign in again.')
    }

    if (response.status === 400) {
      throw new Error('Invalid student data. Check the name and course.')
    }

    throw new Error(`Could not create student (${response.status}).`)
  }

  return response.json()
}


export async function deleteStudent(token, studentId) {
  const response = await fetch(
    `${API_BASE_URL}/api/students/${studentId}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Authentication failed. Please sign in again.')
    }

    if (response.status === 404) {
      throw new Error('Student not found.')
    }

    throw new Error(`Could not delete student (${response.status}).`)
  }
}


export async function updateStudent(token, studentId, studentData) {
  const response = await fetch(
    `${API_BASE_URL}/api/students/${studentId}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(studentData),
    }
  )

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Authentication failed. Please sign in again.')
    }

    if (response.status === 404) {
      throw new Error('Student not found.')
    }

    if (response.status === 400) {
      throw new Error('Invalid student data. Check the name and course.')
    }

    throw new Error(`Could not update student (${response.status}).`)
  }

  return response.json()
}
