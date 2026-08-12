import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  useGetTeamAttendanceQuery,
  useValidateAttendanceMutation,
} from "../../features/attendance/attendanceApi";
import {
  useGetAllOvertimeQuery,
  useApproveOvertimeMutation,
  useRejectOvertimeMutation,
} from "../../features/overtime/overtimeApi";
import { useGetTeamMembersQuery } from "../../features/user/userApi";
import DashboardLayout from "../../components/layout/DashboardLayout";
import StatCard from "../../components/ui/StatCard";
import { Card, CardHeader, CardTitle } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import Badge from "../../components/ui/Badge";
import Input from "../../components/ui/Input";
import EmptyState from "../../components/ui/EmptyState";
import Avatar from "../../components/ui/Avatar";
import FilterPanel from "../../components/ui/FilterPanel";
import Pagination from "../../components/ui/Pagination";
import { 
  Users, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Eye,
  Check,
  X,
  Calendar,
  MapPin
} from "lucide-react";
import { getStatusBadge, formatTime, formatDate, formatWorkingHours, getGreeting } from "../../utils/statusHelpers";

const ManagerDashboard = () => {
  const { user } = useSelector((state) => state.auth);

  // Filter and Pagination State for Team Attendance
  const [attendanceFilters, setAttendanceFilters] = useState({
    startDate: '',
    endDate: '',
    userId: '',
  });
  const [attendancePage, setAttendancePage] = useState(1);
  const attendanceLimit = 10;

  // Filter and Pagination State for Overtime
  const [overtimeFilters, setOvertimeFilters] = useState({
    startDate: '',
    endDate: '',
    userId: '',
    status: '',
  });
  const [overtimePage, setOvertimePage] = useState(1);
  const overtimeLimit = 10;

  const { data: teamAttendanceData, isLoading: loadingAttendance } = useGetTeamAttendanceQuery({
    ...attendanceFilters,
    page: attendancePage,
    limit: attendanceLimit,
  });
  const { data: overtimeData, isLoading: loadingOvertime } = useGetAllOvertimeQuery({
    ...overtimeFilters,
    page: overtimePage,
    limit: overtimeLimit,
  });
  const { data: teamMembersData } = useGetTeamMembersQuery();

  const [validateAttendance] = useValidateAttendanceMutation();
  const [approveOvertime] = useApproveOvertimeMutation();
  const [rejectOvertime] = useRejectOvertimeMutation();

  const [selectedAttendance, setSelectedAttendance] = useState(null);
  const [validationForm, setValidationForm] = useState({
    status: "valid",
    remarks: "",
  });

  const [selectedOvertime, setSelectedOvertime] = useState(null);
  const [overtimeRemarks, setOvertimeRemarks] = useState("");

  // Reset to page 1 when filters change
  useEffect(() => {
    setAttendancePage(1);
  }, [attendanceFilters]);

  useEffect(() => {
    setOvertimePage(1);
  }, [overtimeFilters]);

  const overtimeStatusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
  ];

  const handleValidateAttendance = (attendance) => {
    setSelectedAttendance(attendance);
    setValidationForm({
      status: "valid",
      remarks: "",
    });
  };

  const handleValidationSubmit = async (e) => {
    e.preventDefault();

    try {
      await validateAttendance({
        id: selectedAttendance._id,
        validationStatus: validationForm.status,
        validationRemarks: validationForm.remarks,
      }).unwrap();
      setSelectedAttendance(null);
    } catch (error) {
      alert(error?.data?.message || "Validation failed");
    }
  };

  const handleApproveOvertime = async (overtime) => {
    try {
      await approveOvertime({
        id: overtime._id,
        remarks: overtimeRemarks,
      }).unwrap();
      setSelectedOvertime(null);
      setOvertimeRemarks("");
    } catch (error) {
      alert(error?.data?.message || "Approval failed");
    }
  };

  const handleRejectOvertime = async (overtime) => {
    if (!overtimeRemarks) {
      alert("Please provide remarks for rejection");
      return;
    }

    try {
      await rejectOvertime({
        id: overtime._id,
        remarks: overtimeRemarks,
      }).unwrap();
      setSelectedOvertime(null);
      setOvertimeRemarks("");
    } catch (error) {
      alert(error?.data?.message || "Rejection failed");
    }
  };

  const pendingValidation = teamAttendanceData?.attendance?.filter(
    (a) => a.validationStatus === "pending"
  ).length || 0;

  const pendingOvertimeCount = overtimeData?.overtime?.filter(
    (ot) => ot.status === "pending"
  ).length || 0;

  return (
    <DashboardLayout title="Team Management" subtitle={`${getGreeting()}, ${user?.name} 👋`}>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <StatCard
          title="Team Members"
          value={teamMembersData?.count || 0}
          icon={Users}
          color="primary"
        />
        <StatCard
          title="Pending Validations"
          value={pendingValidation}
          icon={AlertCircle}
          color="warning"
        />
        <StatCard
          title="Pending Overtime"
          value={pendingOvertimeCount}
          icon={Clock}
          color="info"
        />
      </div>

      {/* Team Attendance */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Team Attendance</CardTitle>
        </CardHeader>

        {/* Filters */}
        <div className="px-6 pb-4">
          <FilterPanel
            filters={attendanceFilters}
            onFiltersChange={setAttendanceFilters}
            users={teamMembersData?.employees || []}
            showUserFilter={true}
            showDateFilter={true}
            showStatusFilter={false}
          />
        </div>

        {loadingAttendance ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto"></div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-4">Loading attendance...</p>
          </div>
        ) : !teamAttendanceData?.attendance || teamAttendanceData.attendance.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No attendance records"
            description={attendanceFilters.startDate || attendanceFilters.endDate || attendanceFilters.userId ? "No records found for the selected filters" : "Team attendance records will appear here"}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="text-left py-3 px-4 text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      Employee
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      Punch In
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      Punch Out
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      Hours
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      Validation
                    </th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {teamAttendanceData.attendance.map((record) => (
                    <tr key={record._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <Avatar name={record.employee?.name} size="sm" />
                          <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                            {record.employee?.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-900 dark:text-slate-100">{formatDate(record.punchInTime)}</td>
                      <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400">{formatTime(record.punchInTime)}</td>
                      <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400">{formatTime(record.punchOutTime)}</td>
                      <td className="py-3 px-4 text-sm text-slate-900 dark:text-slate-100 font-medium">
                        {formatWorkingHours(record.totalWorkingHours)}
                      </td>
                      <td className="py-3 px-4">{getStatusBadge(record.workingStatus)}</td>
                      <td className="py-3 px-4">{getStatusBadge(record.validationStatus)}</td>
                      <td className="py-3 px-4 text-right">
                        <Button
                          onClick={() => handleValidateAttendance(record)}
                          variant="ghost"
                          size="sm"
                          icon={Eye}
                        >
                          Review
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <Pagination
              currentPage={attendancePage}
              totalPages={teamAttendanceData?.pages || 1}
              onPageChange={setAttendancePage}
            />
          </>
        )}
      </Card>

      {/* Pending Overtime Requests */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Overtime Requests</CardTitle>
        </CardHeader>

        {/* Filters */}
        <div className="px-6 pb-4">
          <FilterPanel
            filters={overtimeFilters}
            onFiltersChange={setOvertimeFilters}
            users={teamMembersData?.employees || []}
            showUserFilter={true}
            showDateFilter={true}
            showStatusFilter={true}
            statusOptions={overtimeStatusOptions}
          />
        </div>

        {loadingOvertime ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto"></div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-4">Loading requests...</p>
          </div>
        ) : !overtimeData?.overtime || overtimeData.overtime.length === 0 ? (
          <EmptyState
            icon={Clock}
            title="No overtime requests"
            description={overtimeFilters.startDate || overtimeFilters.endDate || overtimeFilters.userId || overtimeFilters.status ? "No requests found for the selected filters" : "Overtime requests from your team will appear here"}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="text-left py-3 px-4 text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      Employee
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      Hours
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      Reason
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {overtimeData.overtime.map((ot) => (
                    <tr key={ot._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <Avatar name={ot.employee?.name} size="sm" />
                          <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                            {ot.employee?.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-900 dark:text-slate-100">{formatDate(ot.createdAt)}</td>
                      <td className="py-3 px-4 text-sm text-slate-900 dark:text-slate-100 font-medium">{ot.hours}h</td>
                      <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400 max-w-xs truncate">{ot.reason}</td>
                      <td className="py-3 px-4">{getStatusBadge(ot.status)}</td>
                      <td className="py-3 px-4 text-right">
                        <Button
                          onClick={() => setSelectedOvertime(ot)}
                          variant="ghost"
                          size="sm"
                          icon={Eye}
                        >
                          Review
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <Pagination
              currentPage={overtimePage}
              totalPages={overtimeData?.pages || 1}
              onPageChange={setOvertimePage}
            />
          </>
        )}
      </Card>

      {/* Team Members */}
      <Card>
        <CardHeader>
          <CardTitle>Employees ({teamMembersData?.count || 0})</CardTitle>
        </CardHeader>

        {!teamMembersData?.employees || teamMembersData.employees.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No employees found"
            description="Employee accounts will appear here"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Role
                  </th>
                 
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Joined
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {teamMembersData.employees.map((emp) => (
                  <tr key={emp._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={emp.name} size="sm" />
                        <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{emp.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400">{emp.email}</td>
                    <td className="py-3 px-4">
                      <Badge variant="info">Employee</Badge>
                    </td>
                   
                    <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400">{formatDate(emp.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Validation Modal */}
      <Modal
        isOpen={!!selectedAttendance}
        onClose={() => setSelectedAttendance(null)}
        title="Validate Attendance"
        size="lg"
      >
        {selectedAttendance && (
          <div className="p-6">
            {/* Employee Info */}
            <div className="bg-slate-50 dark:bg-slate-700 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-4 mb-4">
                <Avatar name={selectedAttendance.employee?.name} size="lg" />
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    {selectedAttendance.employee?.name}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{formatDate(selectedAttendance.punchInTime)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Punch In</p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {formatTime(selectedAttendance.punchInTime)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Punch Out</p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {formatTime(selectedAttendance.punchOutTime)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Working Hours</p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {formatWorkingHours(selectedAttendance.totalWorkingHours)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Location</p>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-500 dark:text-slate-400" />
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      {selectedAttendance.location?.latitude?.toFixed(4)},{" "}
                      {selectedAttendance.location?.longitude?.toFixed(4)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Selfie */}
            {selectedAttendance.selfie && (
              <div className="mb-6">
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-3">Attendance Selfie</p>
                <div className="relative rounded-xl overflow-hidden border-2 border-slate-200 dark:border-slate-600">
                  <img
                    src={selectedAttendance.selfie}
                    alt="Employee Selfie"
                    className="w-full h-auto"
                  />
                </div>
              </div>
            )}

            {/* Validation Form */}
            <form onSubmit={handleValidationSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Validation Status
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setValidationForm({ ...validationForm, status: "valid" })}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      validationForm.status === "valid"
                        ? "border-green-500 bg-green-50"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <CheckCircle className={`w-6 h-6 mx-auto mb-2 ${
                      validationForm.status === "valid" ? "text-green-600" : "text-slate-400"
                    }`} />
                    <p className={`text-sm font-medium ${
                      validationForm.status === "valid" ? "text-green-900" : "text-slate-600"
                    }`}>
                      Valid
                    </p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setValidationForm({ ...validationForm, status: "invalid" })}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      validationForm.status === "invalid"
                        ? "border-red-500 bg-red-50"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <AlertCircle className={`w-6 h-6 mx-auto mb-2 ${
                      validationForm.status === "invalid" ? "text-red-600" : "text-slate-400"
                    }`} />
                    <p className={`text-sm font-medium ${
                      validationForm.status === "invalid" ? "text-red-900" : "text-slate-600"
                    }`}>
                      Invalid
                    </p>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Remarks {validationForm.status === "invalid" && "(Required)"}
                </label>
                <textarea
                  value={validationForm.remarks}
                  onChange={(e) => setValidationForm({ ...validationForm, remarks: e.target.value })}
                  required={validationForm.status === "invalid"}
                  rows="3"
                  className="block w-full rounded-lg border border-slate-300 dark:border-slate-600 px-4 py-2.5 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-slate-700"
                  placeholder="Add any remarks or notes..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  variant="success"
                  size="lg"
                  className="flex-1"
                  icon={Check}
                >
                  Submit Validation
                </Button>
                <Button
                  type="button"
                  onClick={() => setSelectedAttendance(null)}
                  variant="secondary"
                  size="lg"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}
      </Modal>

      {/* Overtime Review Modal */}
      <Modal
        isOpen={!!selectedOvertime}
        onClose={() => {
          setSelectedOvertime(null);
          setOvertimeRemarks("");
        }}
        title="Review Overtime Request"
        size="md"
      >
        {selectedOvertime && (
          <div className="p-6">
            {/* Employee Info */}
            <div className="bg-slate-50 dark:bg-slate-700 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-4 mb-4">
                <Avatar name={selectedOvertime.employee?.name} size="lg" />
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    {selectedOvertime.employee?.name}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{formatDate(selectedOvertime.createdAt)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Requested Hours</p>
                  <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">{selectedOvertime.hours}h</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Status</p>
                  {getStatusBadge(selectedOvertime.status)}
                </div>
              </div>
            </div>

            {/* Reason */}
            <div className="mb-6">
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-2">Reason for Overtime</p>
              <p className="text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
                {selectedOvertime.reason}
              </p>
            </div>

            {/* Remarks Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Remarks (Required for rejection)
              </label>
              <textarea
                value={overtimeRemarks}
                onChange={(e) => setOvertimeRemarks(e.target.value)}
                rows="3"
                className="block w-full rounded-lg border border-slate-300 dark:border-slate-600 px-4 py-2.5 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-slate-700"
                placeholder="Add remarks or feedback..."
              />
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => handleApproveOvertime(selectedOvertime)}
                variant="success"
                size="lg"
                icon={Check}
              >
                Approve
              </Button>
              <Button
                onClick={() => handleRejectOvertime(selectedOvertime)}
                variant="danger"
                size="lg"
                icon={X}
              >
                Reject
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
};

export default ManagerDashboard;
