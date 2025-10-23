/**
 * Firebase Auth Error Code to User-Friendly Message Mapper
 */

export const getAuthErrorMessage = (errorCode: string): string => {
  const errorMessages: { [key: string]: string } = {
    // Email/Password errors
    'auth/email-already-in-use': 'This email address is already registered. Please login instead.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/user-not-found': 'No account found with this email address.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/invalid-credential': 'Invalid email or password. Please check your credentials.',

    // Password errors
    'auth/weak-password': 'Password is too weak. Please use at least 8 characters.',
    'auth/missing-password': 'Please enter a password.',

    // Account errors
    'auth/user-disabled': 'This account has been disabled. Please contact support.',
    'auth/account-exists-with-different-credential': 'An account already exists with this email but different sign-in method.',

    // Network/Server errors
    'auth/network-request-failed': 'Network error. Please check your internet connection and try again.',
    'auth/too-many-requests': 'Too many failed attempts. Please try again later or reset your password.',
    'auth/operation-not-allowed': 'This sign-in method is not enabled. Please contact support.',

    // Session errors
    'auth/requires-recent-login': 'Please log in again to complete this action.',
    'auth/expired-action-code': 'This link has expired. Please request a new one.',
    'auth/invalid-action-code': 'This link is invalid or has already been used.',

    // Other errors
    'auth/popup-closed-by-user': 'Sign-in popup was closed before completing.',
    'auth/cancelled-popup-request': 'Sign-in was cancelled.',
    'auth/popup-blocked': 'Sign-in popup was blocked by your browser. Please allow popups.',
  };

  return errorMessages[errorCode] || 'An unexpected error occurred. Please try again.';
};

/**
 * Extracts Firebase error code from error object
 */
export const getFirebaseErrorCode = (error: any): string => {
  if (error?.code) {
    return error.code;
  }
  if (error?.message?.includes('auth/')) {
    const match = error.message.match(/auth\/[\w-]+/);
    return match ? match[0] : 'unknown-error';
  }
  return 'unknown-error';
};

/**
 * Gets user-friendly error message from Firebase error object
 */
export const getFriendlyAuthError = (error: any): string => {
  const errorCode = getFirebaseErrorCode(error);
  return getAuthErrorMessage(errorCode);
};
