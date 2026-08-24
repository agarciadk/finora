// Abstract boundary so we're not coupled to a specific email provider yet
// (SendGrid/Resend/SES can implement this later without touching AuthService).
export abstract class MailService {
  abstract sendVerificationEmail(to: string, token: string): Promise<void>;
  abstract sendPasswordResetEmail(to: string, token: string): Promise<void>;
}
