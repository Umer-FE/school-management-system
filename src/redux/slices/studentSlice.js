import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Async thunk to fetch students
export const fetchStudents = createAsyncThunk(
  "students/fetchStudents",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch("/api/students");
      const data = await response.json();
      if (!data.success) return rejectWithValue(data.error);
      return data.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

// Async thunk to add/enroll a student
export const enrollStudent = createAsyncThunk(
  "students/enrollStudent",
  async (studentData, { rejectWithValue }) => {
    try {
      const response = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(studentData),
      });
      const data = await response.json();
      if (!data.success) return rejectWithValue(data.error);
      return data.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

const studentSlice = createSlice({
  name: "students",
  initialState: {
    list: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Students
      .addCase(fetchStudents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStudents.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchStudents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(enrollStudent.fulfilled, (state, action) => {
        const index = state.list.findIndex(
          (s) => s.email === action.payload.email,
        );
        if (index !== -1) {
          state.list[index] = {
            ...state.list[index],
            ...action.payload,
            isProfileCompleted: true,
          };
        } else {
          state.list.unshift(action.payload);
        }
      });
  },
});

export default studentSlice.reducer;
