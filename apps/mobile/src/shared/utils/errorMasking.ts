/**
 * Sensitive Message Shield & Privacy Error Sanitization Filter
 * Architecture Reference: HUMAN_UI_GUEST_REVAMP_SPEC.md Section 5
 *
 * Ensures no raw stack traces, MongoDB/Mongoose connection errors,
 * cryptographic parameters, or system jargon are ever exposed to users.
 */

export function getFriendlyErrorMessage(error: any): string {
  if (!error) {
    return "Something went wrong. Please try again.";
  }

  const message = typeof error === 'string' ? error : error.message || '';
  const status = error.response?.status || error.status;

  // 1. Network Disconnections & Server Unreachable
  if (
    message.includes('Network request failed') ||
    message.includes('Network Error') ||
    message.includes('ECONNREFUSED') ||
    message.includes('ENOTFOUND') ||
    error.code === 'ECONNREFUSED'
  ) {
    return "We're having trouble connecting to the network. Please check your internet connection and try again.";
  }

  // 2. Authentication & Session Expirations
  if (status === 401 || message.includes('Unauthorized') || message.includes('Token expired')) {
    return "Your session has expired. Please sign in again to continue.";
  }

  // 3. Permission / Forbidden
  if (status === 403 || message.includes('Forbidden')) {
    return "You do not have permission to perform this action.";
  }

  // 4. Resource Not Found
  if (status === 404 || message.includes('not found')) {
    return "The requested health record or information could not be found.";
  }

  // 5. Rate Limiting
  if (status === 429 || message.includes('Too many requests')) {
    return "Too many requests. Please wait a moment before trying again.";
  }

  // 6. Server Internal Errors & Database Shield
  // Mask all MongoDB, Mongoose, ReplicaSet, BSON, or Node internals
  if (
    status >= 500 ||
    message.includes('Mongoose') ||
    message.includes('Mongo') ||
    message.includes('E11000') ||
    message.includes('CastError') ||
    message.includes('ValidationError') ||
    message.includes('Internal Server Error')
  ) {
    return "Our health servers are currently busy. Your data is safe; please try again in a few moments.";
  }

  // 7. Human friendly pass-through if already polished
  if (
    message.length > 0 &&
    !message.includes('{') &&
    !message.includes('at ') &&
    !message.includes('Error:') &&
    !message.includes('Object')
  ) {
    return message;
  }

  // Default fallback
  return "Something went wrong. Please try again.";
}
