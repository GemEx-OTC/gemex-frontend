/**
 * Camera permission pre-flight for the Smile ID Web SDK.
 *
 * IMPORTANT: call this as the FIRST thing inside a click handler (before any
 * `await`), otherwise browsers like iOS Safari may not treat the request as a
 * user gesture and will silently refuse to show the permission prompt.
 */

export type CameraPermissionResult =
  | { granted: true }
  | { granted: false; reason: CameraDeniedReason; message: string }

export type CameraDeniedReason =
  | "denied"
  | "no-camera"
  | "in-use"
  | "insecure"
  | "unsupported"
  | "unknown"

export async function requestCameraPermission(): Promise<CameraPermissionResult> {
  if (typeof window === "undefined") {
    return { granted: false, reason: "unsupported", message: "Camera is not available." }
  }

  if (!window.isSecureContext) {
    return {
      granted: false,
      reason: "insecure",
      message: "Camera access requires a secure (https) connection.",
    }
  }

  if (!navigator.mediaDevices?.getUserMedia) {
    return {
      granted: false,
      reason: "unsupported",
      message: "Your browser does not support camera access. Please use the latest Chrome, Safari, or Firefox.",
    }
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user" },
      audio: false,
    })
    // Release the camera immediately so the Smile ID SDK can acquire it.
    stream.getTracks().forEach((track) => track.stop())
    return { granted: true }
  } catch (err: any) {
    const name: string = err?.name || ""

    if (name === "NotAllowedError" || name === "PermissionDeniedError" || name === "SecurityError") {
      return {
        granted: false,
        reason: "denied",
        message:
          "Camera access was blocked. Please allow camera access for this site in your browser settings (tap the lock/camera icon in the address bar), then try again.",
      }
    }
    if (name === "NotFoundError" || name === "DevicesNotFoundError" || name === "OverconstrainedError") {
      return {
        granted: false,
        reason: "no-camera",
        message: "No camera was found on this device. Please use a device with a working camera.",
      }
    }
    if (name === "NotReadableError" || name === "TrackStartError" || name === "AbortError") {
      return {
        granted: false,
        reason: "in-use",
        message: "Your camera is being used by another app or tab. Please close it and try again.",
      }
    }
    return {
      granted: false,
      reason: "unknown",
      message: "We couldn't access your camera. Please check your browser permissions and try again.",
    }
  }
}
