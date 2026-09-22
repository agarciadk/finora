import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';
import { MailService } from './mail.service';

function getFrontendUrl(): string {
  return process.env['FRONTEND_URL'] ?? 'http://localhost:5173';
}

// Accent/background pulled from the Finora app icon (teal-to-indigo mark on navy).
const BRAND_ACCENT = '#14b8a6';
const BRAND_DARK = '#0f172a';

function buildEmailHtml(options: {
  heading: string;
  message: string;
  ctaLabel: string;
  ctaUrl: string;
  footnote: string;
}): string {
  const { heading, message, ctaLabel, ctaUrl, footnote } = options;
  const logoUrl = `${getFrontendUrl()}/android-chrome-192x192.png`;

  // Table-based layout with inline styles: required for consistent rendering
  // across email clients (Outlook/Gmail strip <style> blocks and flex/grid).
  return `<!DOCTYPE html>
<html lang="es">
  <body style="margin:0;padding:0;background-color:#f1f5f9;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f1f5f9;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background-color:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;">
            <tr>
              <td align="center" style="background-color:${BRAND_DARK};padding:24px;">
                <img src="${logoUrl}" width="48" height="48" alt="Finora" style="display:block;margin:0 auto;border-radius:12px;" />
                <div style="color:#ffffff;font-size:18px;font-weight:bold;margin-top:8px;">Finora</div>
              </td>
            </tr>
            <tr>
              <td style="padding:32px 32px 24px;color:#0f172a;">
                <h1 style="margin:0 0 16px;font-size:20px;line-height:28px;">${heading}</h1>
                <p style="margin:0 0 24px;font-size:15px;line-height:22px;color:#334155;">${message}</p>
                <table role="presentation" cellpadding="0" cellspacing="0">
                  <tr>
                    <td align="center" style="border-radius:8px;background-color:${BRAND_ACCENT};">
                      <a href="${ctaUrl}" style="display:inline-block;padding:12px 24px;font-size:15px;font-weight:bold;color:#ffffff;text-decoration:none;">${ctaLabel}</a>
                    </td>
                  </tr>
                </table>
                <p style="margin:24px 0 0;font-size:13px;line-height:20px;color:#94a3b8;">${footnote}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 32px;background-color:#f8fafc;border-top:1px solid #e2e8f0;">
                <p style="margin:0;font-size:12px;line-height:18px;color:#94a3b8;text-align:center;">© ${new Date().getFullYear()} Finora. Todos los derechos reservados.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
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
    const html = buildEmailHtml({
      heading: 'Verifica tu correo',
      message:
        'Gracias por registrarte en Finora. Confirma tu correo para activar tu cuenta y empezar a gestionar tus finanzas.',
      ctaLabel: 'Verificar mi correo',
      ctaUrl: link,
      footnote:
        'Si no creaste una cuenta en Finora, puedes ignorar este mensaje.',
    });
    await this.send(
      to,
      'Verifica tu correo en Finora',
      `Confirma tu cuenta visitando el siguiente enlace: ${link}`,
      html,
    );
  }

  async sendPasswordResetEmail(to: string, token: string): Promise<void> {
    const link = `${getFrontendUrl()}/restablecer-password?token=${token}`;
    const html = buildEmailHtml({
      heading: 'Restablece tu contraseña',
      message:
        'Hemos recibido una solicitud para restablecer tu contraseña de Finora. Este enlace caduca en 15 minutos.',
      ctaLabel: 'Restablecer contraseña',
      ctaUrl: link,
      footnote:
        'Si no solicitaste este cambio, puedes ignorar este mensaje: tu contraseña seguirá siendo la misma.',
    });
    await this.send(
      to,
      'Restablece tu contraseña en Finora',
      `Restablece tu contraseña visitando el siguiente enlace (caduca en 15 minutos): ${link}`,
      html,
    );
  }

  private async send(to: string, subject: string, text: string, html: string) {
    if (!this.resend || process.env.NODE_ENV === 'test') {
      // No RESEND_API_KEY configured, or running tests (Jest/Playwright set
      // NODE_ENV=test, and Resend rejects @example.com addresses anyway):
      // log instead of hitting the real API, as if the "inbox" were stdout.
      this.logger.log(`[dev email] to=${to} subject="${subject}" ${text}`);
      return;
    }

    try {
      const { data, error } = await this.resend.emails.send({
        from: 'Finora <finora@gapaci.dev>',
        to,
        subject,
        text,
        html,
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
