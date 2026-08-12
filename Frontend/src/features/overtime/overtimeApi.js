import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const overtimeApi = createApi({
  reducerPath: "overtimeApi",

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
      query: () => ({
        url: "/overtime/my",
        method: "GET",
      }),

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
      query: () => ({
        url: "/overtime/all",
        method: "GET",
      }),

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

