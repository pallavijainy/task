import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const attendanceApi = createApi({
  reducerPath: "attendanceApi",

  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:3000/api",

    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");

      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }

      headers.set("Content-Type", "application/json");

      return headers;
    },
  }),

  tagTypes: ["Attendance"],

  endpoints: (builder) => ({
    punchIn: builder.mutation({
      query: (data) => ({
        url: "/attendance/punch-in",
        method: "POST",
        body: data,
      }),

      invalidatesTags: ["Attendance"],
    }),

    punchOut: builder.mutation({
      query: () => ({
        url: "/attendance/punch-out",
        method: "POST",
      }),

      invalidatesTags: ["Attendance"],
    }),

    getMyAttendance: builder.query({
      query: () => ({
        url: "/attendance/my",
        method: "GET",
      }),

      providesTags: ["Attendance"],
    }),

    getTodayAttendance: builder.query({
      query: () => ({
        url: "/attendance/today",
        method: "GET",
      }),

      providesTags: ["Attendance"],
    }),

    getTeamAttendance: builder.query({
      query: () => ({
        url: "/attendance/team",
        method: "GET",
      }),

      providesTags: ["Attendance"],
    }),

    getAllAttendance: builder.query({
      query: () => ({
        url: "/attendance/all",
        method: "GET",
      }),

      providesTags: ["Attendance"],
    }),

    getAttendanceById: builder.query({
      query: (id) => ({
        url: `/attendance/${id}`,
        method: "GET",
      }),

      providesTags: ["Attendance"],
    }),

    validateAttendance: builder.mutation({
      query: ({ id, validationStatus, validationRemarks }) => ({
        url: `/attendance/${id}/validate`,
        method: "PATCH",
        body: { validationStatus, validationRemarks },
      }),

      invalidatesTags: ["Attendance"],
    }),
  }),
});

export const {
  usePunchInMutation,
  usePunchOutMutation,
  useGetMyAttendanceQuery,
  useGetTodayAttendanceQuery,
  useGetTeamAttendanceQuery,
  useGetAllAttendanceQuery,
  useGetAttendanceByIdQuery,
  useValidateAttendanceMutation,
} = attendanceApi;
