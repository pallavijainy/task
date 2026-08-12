import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  useGetTodayAttendanceQuery,
  useGetMyAttendanceQuery,
  usePunchInMutation,
  usePunchOutMutation,
} from "../../features/attendance/attendanceApi";
import {
  useGetMyOvertimeQuery,
  useCreateOvertimeRequestMutation,
} from "../../features/overtime/overtimeApi";
import DashboardLayout from "../../components/layout/DashboardLayout";
import StatCard from "../../components/ui/StatCard";
import { Card, CardHeader, CardTitle } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import CameraCapture from "../../components/CameraCapture";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import EmptyState from "../../components/ui/EmptyState";
import LoadingOverlay from "../../components/ui/LoadingOverlay";
import FilterPanel from "../../components/ui/FilterPanel";
import Pagination from "../../components/ui/Pagination";
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Camera,
  LogOut,
  Plus,
  FileText,
  MapPin,
  Timer
} from "lucide-react";
import { getStatusBadge, formatTime, formatDate, formatWorkingHours, getGreeting } from "../../utils/statusHelpers";

const EmployeeDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [showCamera, setShowCamera] = useState(false);
  const [showOvertimeModal, setShowOvertimeModal] = useState(false);
  const [selectedAttendance, setSelectedAttendance] = useState(null);

  // Filter and Pagination State for Attendance
  const [attendanceFilters, setAttendanceFilters] = useState({
    startDate: '',
    endDate: '',
  });
  const [attendancePage, setAttendancePage] = useState(1);
  const attendanceLimit = 10;

  // Filter and Pagination State for Overtime
  const [overtimeFilters, setOvertimeFilters] = useState({
    startDate: '',
    endDate: '',
    status: '',
  });
  const [overtimePage, setOvertimePage] = useState(1);
  const overtimeLimit = 10;

  const { data: todayData, refetch: refetchToday } = useGetTodayAttendanceQuery();
  const { data: attendanceData } = useGetMyAttendanceQuery({
    ...attendanceFilters,
    page: attendancePage,
    limit: attendanceLimit,
  });
  const { data: overtimeData } = useGetMyOvertimeQuery({
    ...overtimeFilters,
    page: overtimePage,
    limit: overtimeLimit,
  });

  const [punchIn, { isLoading: isPunchingIn }] = usePunchInMutation();
  const [punchOut, { isLoading: isPunchingOut }] = usePunchOutMutation();
  const [createOvertime, { isLoading: isCreatingOvertime }] = useCreateOvertimeRequestMutation();

  const [overtimeForm, setOvertimeForm] = useState({
    hours: "",
    reason: "",
  });

  const todayAttendance = todayData?.attendance;

  // Reset to page 1 when filters change
  useEffect(() => {
    setAttendancePage(1);
  }, [attendanceFilters]);

  useEffect(() => {
    setOvertimePage(1);
  }, [overtimeFilters]);

  const handlePunchInClick = () => {
    setShowCamera(true);
  };

  const handleCaptureComplete = async (imageData) => {
    setShowCamera(false);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };

          try {
            // The isPunchingIn state from RTK Query mutation will handle the loading state
            await punchIn({
              selfie: imageData,
              latitude: coords.latitude,
              longitude: coords.longitude,
            }).unwrap();
            refetchToday();
          } catch (error) {
            alert(error?.data?.message || "Punch in failed");
          }
        },
        () => {
          alert("Location access is required for attendance.");
        }
      );
    } else {
      alert("Your browser does not support geolocation.");
    }
  };

  const handlePunchOut = async () => {
    try {
      await punchOut().unwrap();
      refetchToday();
    } catch (error) {
      alert(error?.data?.message || "Punch out failed");
    }
  };

  const handleRequestOvertime = (attendance) => {
    setSelectedAttendance(attendance);
    setOvertimeForm({ hours: "", reason: "" });
    setShowOvertimeModal(true);
  };

  const handleOvertimeSubmit = async (e) => {
    e.preventDefault();

    if (!overtimeForm.hours || !overtimeForm.reason) {
      alert("Please fill in all fields");
      return;
    }

    try {
      await createOvertime({
        attendanceId: selectedAttendance._id,
        ...overtimeForm,
      }).unwrap();
      setShowOvertimeModal(false);
    } catch (error) {
      alert(error?.data?.message || "Overtime request failed");
    }
  };

  // Calculate stats
  const totalPresent = attendanceData?.total || 0;
  const completed = attendanceData?.attendance?.filter(a => a.workingStatus === 'completed').length || 0;
  const pendingValidation = attendanceData?.attendance?.filter(a => a.validationStatus === 'pending').length || 0;
  const pendingOT = overtimeData?.overtime?.filter(ot => ot.status === 'pending').length || 0;

  const overtimeStatusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
  ];

  return (
    <DashboardLayout title="Dashboard" subtitle={`${getGreeting()}, ${user?.name} 👋`}>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard
          title="Today's Status"
          value={todayAttendance ? "Present" : "Not Punched In"}
          icon={Calendar}
          color={todayAttendance ? "success" : "warning"}
        />
        <StatCard
          title="Working Hours"
          value={todayAttendance ? formatWorkingHours(todayAttendance.totalWorkingHours) : "0h 0m"}
          icon={Clock}
          color="primary"
        />
        <StatCard
          title="Validation Status"
          value={todayAttendance?.validationStatus || "N/A"}
          icon={CheckCircle}
          color={todayAttendance?.validationStatus === 'valid' ? 'success' : 'warning'}
        />
        <StatCard
          title="Overtime Requests"
          value={pendingOT}
          icon={FileText}
          color="info"
        />
      </div>

      {/* Punch In/Out Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Today's Attendance</CardTitle>
        </CardHeader>

        {!todayAttendance ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Camera className="w-8 h-8 text-primary-600 dark:text-primary-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">Ready to start your day?</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">You haven't punched in yet today</p>
            <Button
              onClick={handlePunchInClick}
              variant="primary"
              size="lg"
              icon={Camera}
              loading={isPunchingIn}
            >
              Punch In
            </Button>
          </div>
        ) : (
          <div>
            <div className="bg-gradient-to-r from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20 rounded-xl p-6 mb-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white dark:bg-slate-700 rounded-full flex items-center justify-center shadow-sm">
                    {todayAttendance.punchOutTime ? (
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    ) : (
                      <Timer className="w-6 h-6 text-primary-600 animate-pulse" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                      {todayAttendance.punchOutTime ? "Day Completed" : "You're Working"}
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {todayAttendance.punchOutTime ? "Great job today!" : "Keep up the good work!"}
                    </p>
                  </div>
                </div>
                {getStatusBadge(todayAttendance.workingStatus)}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/50 dark:bg-slate-700/50 rounded-lg p-4">
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Punch In</p>
                  <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">{formatTime(todayAttendance.punchInTime)}</p>
                </div>
                <div className="bg-white/50 dark:bg-slate-700/50 rounded-lg p-4">
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Punch Out</p>
                  <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    {todayAttendance.punchOutTime ? formatTime(todayAttendance.punchOutTime) : "—"}
                  </p>
                </div>
                <div className="bg-white/50 dark:bg-slate-700/50 rounded-lg p-4">
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Working Hours</p>
                  <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    {formatWorkingHours(todayAttendance.totalWorkingHours)}
                  </p>
                </div>
              </div>
            </div>

            {!todayAttendance.punchOutTime && (
              <Button
                onClick={handlePunchOut}
                variant="danger"
                size="lg"
                icon={LogOut}
                loading={isPunchingOut}
                className="w-full"
              >
                Punch Out
              </Button>
            )}

            {todayAttendance.validationRemarks && (
              <div className="mt-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                <p className="font-medium text-amber-900 dark:text-amber-300 mb-1">Validation Remarks</p>
                <p className="text-sm text-amber-800 dark:text-amber-400">{todayAttendance.validationRemarks}</p>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Attendance History */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Recent Attendance</CardTitle>
        </CardHeader>

        {/* Filters */}
        <div className="px-6 pb-4">
          <FilterPanel
            filters={attendanceFilters}
            onFiltersChange={setAttendanceFilters}
            showUserFilter={false}
            showDateFilter={true}
            showStatusFilter={false}
          />
        </div>

        {!attendanceData?.attendance || attendanceData.attendance.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No attendance records"
            description={attendanceFilters.startDate || attendanceFilters.endDate ? "No records found for the selected date range" : "Your attendance history will appear here"}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="text-left py-3 px-4 text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">Date</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">Punch In</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">Punch Out</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">Hours</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">Validation</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">Overtime</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {attendanceData.attendance.map((record) => (
                    <tr key={record._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                      <td className="py-3 px-4 text-sm text-slate-900 dark:text-slate-100">{formatDate(record.punchInTime)}</td>
                      <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400">{formatTime(record.punchInTime)}</td>
                      <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400">{formatTime(record.punchOutTime)}</td>
                      <td className="py-3 px-4 text-sm text-slate-900 dark:text-slate-100 font-medium">
                        {formatWorkingHours(record.totalWorkingHours)}
                      </td>
                      <td className="py-3 px-4">{getStatusBadge(record.workingStatus)}</td>
                      <td className="py-3 px-4">{getStatusBadge(record.validationStatus)}</td>
                      <td className="py-3 px-4">{getStatusBadge(record.overtimeStatus)}</td>
                      <td className="py-3 px-4 text-right">
                        {record.punchOutTime && record.overtimeStatus === "none" && (
                          <Button
                            onClick={() => handleRequestOvertime(record)}
                            variant="ghost"
                            size="sm"
                            icon={Plus}
                          >
                            Request OT
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <Pagination
              currentPage={attendancePage}
              totalPages={attendanceData?.pages || 1}
              onPageChange={setAttendancePage}
            />
          </>
        )}
      </Card>

      {/* Overtime Requests */}
      <Card>
        <CardHeader>
          <CardTitle>Overtime Requests</CardTitle>
        </CardHeader>

        {/* Filters */}
        <div className="px-6 pb-4">
          <FilterPanel
            filters={overtimeFilters}
            onFiltersChange={setOvertimeFilters}
            showUserFilter={false}
            showDateFilter={true}
            showStatusFilter={true}
            statusOptions={overtimeStatusOptions}
          />
        </div>

        {!overtimeData?.overtime || overtimeData.overtime.length === 0 ? (
          <EmptyState
            icon={Clock}
            title="No overtime requests"
            description={overtimeFilters.startDate || overtimeFilters.endDate || overtimeFilters.status ? "No requests found for the selected filters" : "Your overtime requests will appear here"}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="text-left py-3 px-4 text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">Date</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">Hours</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">Reason</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {overtimeData.overtime.map((ot) => (
                    <tr key={ot._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                      <td className="py-3 px-4 text-sm text-slate-900 dark:text-slate-100">{formatDate(ot.createdAt)}</td>
                      <td className="py-3 px-4 text-sm text-slate-900 dark:text-slate-100 font-medium">{ot.hours}h</td>
                      <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400">{ot.reason}</td>
                      <td className="py-3 px-4">{getStatusBadge(ot.status)}</td>
                      <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400">{ot.remarks || "—"}</td>
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

      {/* Camera Modal */}
      {showCamera && (
        <CameraCapture
          onCapture={handleCaptureComplete}
          onClose={() => setShowCamera(false)}
        />
      )}

      {/* Overtime Request Modal */}
      <Modal
        isOpen={showOvertimeModal}
        onClose={() => setShowOvertimeModal(false)}
        title="Request Overtime"
        size="md"
      >
        <form onSubmit={handleOvertimeSubmit} className="p-6 space-y-5">
          <Input
            type="number"
            step="0.5"
            min="0.5"
            label="Overtime Hours"
            placeholder="Enter hours (e.g., 2.5)"
            value={overtimeForm.hours}
            onChange={(e) => setOvertimeForm({ ...overtimeForm, hours: e.target.value })}
            required
          />

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Reason
            </label>
            <textarea
              value={overtimeForm.reason}
              onChange={(e) => setOvertimeForm({ ...overtimeForm, reason: e.target.value })}
              required
              rows="4"
              className="block w-full rounded-lg border border-slate-300 dark:border-slate-600 px-4 py-2.5 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-slate-700"
              placeholder="Explain why you need overtime approval..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="flex-1"
              loading={isCreatingOvertime}
            >
              Submit Request
            </Button>
            <Button
              type="button"
              onClick={() => setShowOvertimeModal(false)}
              variant="secondary"
              size="lg"
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

      {/* Loading Overlay for Punch In */}
      {isPunchingIn && (
        <LoadingOverlay 
          message="Punching In..." 
          subMessage="Please wait while we process your attendance"
        />
      )}

      {/* Loading Overlay for Punch Out */}
      {isPunchingOut && (
        <LoadingOverlay 
          message="Punching Out..." 
          subMessage="Saving your attendance record"
        />
      )}
    </DashboardLayout>
  );
};

export default EmployeeDashboard;
