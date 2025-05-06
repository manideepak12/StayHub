import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';

// ✅ Get all students
export const fetchStudents = () => axios.get(`${API_BASE_URL}/students`);

// ✅ Get single student by ID
export const fetchStudentById = (id) => axios.get(`${API_BASE_URL}/students/${id}`);

// ✅ Add student (corrected route to match backend)
export const addStudent = (studentData) => axios.post(`${API_BASE_URL}/students/add`, studentData);

// ✅ Update student
export const updateStudent = (id, updatedData) => axios.put(`${API_BASE_URL}/students/${id}`, updatedData);

// ✅ Delete student
export const deleteStudent = (id) => axios.delete(`${API_BASE_URL}/students/${id}`);

export const checkStudentBookings = (studentId) => {
    return axios.get(`/api/students/${studentId}/check-bookings`);
  };