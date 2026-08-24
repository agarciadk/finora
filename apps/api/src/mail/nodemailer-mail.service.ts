import { Injectable, Logger } from '@nestjs/common';
import { createTransport, type Transporter } from 'nodemailer';
import { MailService } from './mail.service';

function getFrontendUrl(): string {
  return process.env['FRONTEND_URL'] ?? 'http://localhost:5173';
}

@Injectable()
export class NodemailerMailService extends MailService {
  private readonly logger = new Logger(NodemailerMailService.name);
  private readonly transporter: Transporter | null;

  constructor() {
    super();
    this.transporter = this.buildTransporter();
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
    if (!this.transporter) {
      // No SMTP credentials configured (typical in local dev/CI): log the
      // link instead of failing the request, as if the "inbox" were stdout.
      this.logger.log(`[dev email] to=${to} subject="${subject}" ${text}`);
      return;
    }

    await this.transporter.sendMail({
      from: process.env['SMTP_FROM'] ?? 'no-reply@finora.app',
      to,
      subject,
      text,
    });
  }

  private buildTransporter(): Transporter | null {
    const host = process.env['SMTP_HOST'];

    if (!host) {
      return null;
    }

    return createTransport({
      host,
      port: Number(process.env['SMTP_PORT'] ?? 587),
      secure: process.env['SMTP_SECURE'] === 'true',
      auth: process.env['SMTP_USER']
        ? { user: process.env['SMTP_USER'], pass: process.env['SMTP_PASS'] }
        : undefined,
    });
  }
}
