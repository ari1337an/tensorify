export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

interface NewsletterValidationResult {
  isValid: boolean;
  errors: {
    email?: string;
    role?: string;
    otherRole?: string;
    consent?: string;
  };
}

export const validateNewsletterForm = (
  email: string,
  role: string,
  otherRole: string,
  consentGiven: boolean
): NewsletterValidationResult => {
  const result: NewsletterValidationResult = {
    isValid: true,
    errors: {},
  };

  // Validate email
  if (!email.trim()) {
    result.isValid = false;
    result.errors.email = "Email is required";
  } else if (!validateEmail(email)) {
    result.isValid = false;
    result.errors.email = "Please enter a valid email address";
  }

  // Validate role
  if (!role) {
    result.isValid = false;
    result.errors.role = "Please select your role";
  }

  // Validate otherRole if role is 'other'
  if (role === 'other' && !otherRole.trim()) {
    result.isValid = false;
    result.errors.otherRole = "Please specify your role";
  }

  // Validate consent
  if (!consentGiven) {
    result.isValid = false;
    result.errors.consent = "You must agree to receive communications";
  }

  return result;
}; 