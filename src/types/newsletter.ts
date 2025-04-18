/**
 * Roles that users can select when signing up for the newsletter
 */
export type Role = 'student' | 'researcher' | 'developer' | 'other';

/**
 * Newsletter signup form data structure
 */
export interface NewsletterSignupForm {
  email: string;
  role: Role;
  otherRole: string;
  consentGiven: boolean;
} 