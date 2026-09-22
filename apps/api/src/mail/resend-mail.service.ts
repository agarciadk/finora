import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';
import { MailService } from './mail.service';

function getFrontendUrl(): string {
  return process.env['FRONTEND_URL'] ?? 'http://localhost:5173';
}

@Injectable()
export class ResendMailService extends MailService {
  private readonly logger = new Logger(ResendMailService.name);
  private readonly resend: Resend | null;

  constructor() {
    super();
    const apiKey = process.env['RESEND_API_KEY'];
    this.resend = apiKey ? new Resend(apiKey) : null;
  }

  async sendVerificationEmail(to: string, token: string): Promise<void> {
    const link = `${getFrontendUrl()}/verificar-email?token=${token}`;
    await this.send(
      to,
      'Verifica tu correo en Finora',
      `Confirma tu cuenta visitando el siguiente enlace: ${link}`,
    );
  }

  async sendPasswordResetEmail(to: string, token: string): Promise<void> {
    const link = `${getFrontendUrl()}/restablecer-password?token=${token}`;
    await this.send(
      to,
      'Restablece tu contraseña en Finora',
      `Restablece tu contraseña visitando el siguiente enlace (caduca en 15 minutos): ${link}`,
    );
  }

  private async send(to: string, subject: string, text: string) {
    if (!this.resend) {
      // No RESEND_API_KEY configured (typical in local dev/CI): log instead
      // of failing the caller, as if the "inbox" were stdout.
      this.logger.log(`[dev email] to=${to} subject="${subject}" ${text}`);
      return;
    }

    try {
      const { data, error } = await this.resend.emails.send({
        from: 'Finora <finora@gapaci.dev>',
        to,
        subject,
        text,
      });

      if (error) {
        this.logger.error(`Failed to send email to ${to}: ${error.message}`);
        return;
      }

      this.logger.log(`Email sent to ${to} (id: ${data?.id})`);
    } catch (err) {
      this.logger.error(
        `Unexpected error sending email to ${to}`,
        err instanceof Error ? err.stack : String(err),
      );
    }
  }
}
