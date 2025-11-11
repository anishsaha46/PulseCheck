export function handleApiError(error: any): string {
  if (error.response?.data?.error) {
    const { code, message } = error.response.data.error

    const errorMessages: Record<string, string> = {
      INVALID_CREDENTIALS: "Invalid email or password",
      USER_EXISTS: "An account with this email already exists",
      USER_NOT_FOUND: "User not found",
      MONITOR_NOT_FOUND: "Monitor not found",
      ALERT_NOT_FOUND: "Alert not found",
      QUOTA_EXCEEDED: "You have reached your plan limit",
      VALIDATION_ERROR: "Please check your input and try again",
      UNAUTHORIZED: "You are not authorized to perform this action",
      FORBIDDEN: "Access denied",
      NOT_FOUND: "Resource not found",
      INTERNAL_ERROR: "An error occurred. Please try again later.",
    }

    return errorMessages[code] || message || "An error occurred"
  }

  if (error.message === "Network Error") {
    return "Unable to connect to server. Please check your internet connection."
  }

  return error.message || "An unexpected error occurred"
}
