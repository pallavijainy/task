import { useState, useRef, useEffect } from "react";
import { Camera, X, RotateCcw, Check, MapPin, AlertCircle } from "lucide-react";
import Button from "./ui/Button";

const CameraCapture = ({ onCapture, onClose }) => {
  const [stream, setStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [error, setError] = useState(null);
  const [locationStatus, setLocationStatus] = useState('pending');
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 480 },
      });

      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Camera Error:", err);
      setError("Unable to access camera. Please grant camera permission.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageDataUrl = canvas.toDataURL("image/jpeg", 0.8);
    setCapturedImage(imageDataUrl);
    setLocationStatus('checking');
    
    // Stop the camera stream after capturing to save resources
    stopCamera();
  };

  const handleConfirm = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      stopCamera(); // Ensure camera is stopped
      onClose();
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setLocationStatus('pending');
    setError(null); // Clear any previous errors
    
    // Restart the camera when retaking
    startCamera();
  };

  const handleCancel = () => {
    stopCamera();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/75 backdrop-blur-sm">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Modal */}
        <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-soft-lg w-full max-w-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                <Camera className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Take Attendance Selfie</h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">Capture your photo for today's attendance</p>
              </div>
            </div>
            <button
              onClick={handleCancel}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3 mb-4">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800 dark:text-red-400">{error}</p>
              </div>
            )}

            {/* Camera/Image Preview */}
            <div className="relative aspect-video bg-slate-900 rounded-xl overflow-hidden mb-4">
              {!capturedImage ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src={capturedImage}
                  alt="Captured"
                  className="w-full h-full object-cover"
                />
              )}

              {/* Location Status Indicator */}
              {capturedImage && (
                <div className="absolute top-4 right-4 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-lg px-3 py-2 flex items-center gap-2 shadow-soft">
                  <MapPin className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <span className="text-sm font-medium text-slate-900 dark:text-slate-100">Location detected</span>
                </div>
              )}
            </div>

            <canvas ref={canvasRef} style={{ display: "none" }} />

            {/* Info Message */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-800 dark:text-blue-400">
                {!capturedImage 
                  ? "📷 Make sure your face is clearly visible and well-lit"
                  : "✓ Photo captured! Review and confirm to proceed"}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              {!capturedImage ? (
                <>
                  <Button
                    onClick={capturePhoto}
                    disabled={!stream || !!error}
                    variant="primary"
                    size="lg"
                    icon={Camera}
                    className="flex-1"
                  >
                    Capture Photo
                  </Button>
                  <Button
                    onClick={handleCancel}
                    variant="secondary"
                    size="lg"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={handleConfirm}
                    variant="success"
                    size="lg"
                    icon={Check}
                    className="flex-1"
                  >
                    Confirm & Continue
                  </Button>
                  <Button
                    onClick={handleRetake}
                    variant="secondary"
                    size="lg"
                    icon={RotateCcw}
                    className="flex-1"
                  >
                    Retake
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CameraCapture;
