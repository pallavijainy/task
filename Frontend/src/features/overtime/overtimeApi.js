import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_URL } from "../../config/api";

export const overtimeApi = createApi({
  reducerPath: "overtimeApi",

  baseQuery: fetchBaseQuery({
    baseUrl: API_URL,
    credentials: 'include',

    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");

      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }

      headers.set("Content-Type", "application/json");

      return headers;
    },
  }),

  tagTypes: ["Overtime"],

  endpoints: (builder) => ({
    createOvertimeRequest: builder.mutation({
      query: (data) => ({
        url: "/overtime",
        method: "POST",
        body: data,
      }),

      invalidatesTags: ["Overtime"],
    }),

    getMyOvertime: builder.query({
      query: ({ page = 1, limit = 10, startDate, endDate, status } = {}) => {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
        });
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        if (status) params.append('status', status);
        
        return {
          url: `/overtime/my?${params.toString()}`,
          method: "GET",
        };
      },

      providesTags: ["Overtime"],
    }),

    getPendingOvertime: builder.query({
      query: () => ({
        url: "/overtime/pending",
        method: "GET",
      }),

      providesTags: ["Overtime"],
    }),

    getAllOvertime: builder.query({
      query: ({ page = 1, limit = 20, startDate, endDate, userId, status } = {}) => {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
        });
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        if (userId) params.append('userId', userId);
        if (status) params.append('status', status);
        
        return {
          url: `/overtime/all?${params.toString()}`,
          method: "GET",
        };
      },

      providesTags: ["Overtime"],
    }),

    approveOvertime: builder.mutation({
      query: ({ id, remarks }) => ({
        url: `/overtime/${id}/approve`,
        method: "PATCH",
        body: { remarks },
      }),

      invalidatesTags: ["Overtime"],
    }),

    rejectOvertime: builder.mutation({
      query: ({ id, remarks }) => ({
        url: `/overtime/${id}/reject`,
        method: "PATCH",
        body: { remarks },
      }),

      invalidatesTags: ["Overtime"],
    }),
  }),
});

export const {
  useCreateOvertimeRequestMutation,
  useGetMyOvertimeQuery,
  useGetPendingOvertimeQuery,
  useGetAllOvertimeQuery,
  useApproveOvertimeMutation,
  useRejectOvertimeMutation,
} = overtimeApi;

