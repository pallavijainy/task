import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_URL } from "../../config/api";

export const attendanceApi = createApi({
  reducerPath: "attendanceApi",

  baseQuery: fetchBaseQuery({
    baseUrl: API_URL,

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
      query: ({ page = 1, limit = 10, startDate, endDate } = {}) => {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
        });
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        
        return {
          url: `/attendance/my?${params.toString()}`,
          method: "GET",
        };
      },

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
      query: ({ page = 1, limit = 10, startDate, endDate, userId } = {}) => {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
        });
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        if (userId) params.append('userId', userId);
        
        return {
          url: `/attendance/team?${params.toString()}`,
          method: "GET",
        };
      },

      providesTags: ["Attendance"],
    }),

    getAllAttendance: builder.query({
      query: ({ page = 1, limit = 50, startDate, endDate, userId } = {}) => {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
        });
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        if (userId) params.append('userId', userId);
        
        return {
          url: `/attendance/all?${params.toString()}`,
          method: "GET",
        };
      },

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
