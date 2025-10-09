import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private resend: Resend;
  private fromEmail: string;
  private frontendUrl: string;

  constructor(private config: ConfigService) {
    const apiKey = this.config.get<string>('RESEND_API_KEY');
    this.fromEmail =
      this.config.get<string>('RESEND_FROM_EMAIL') || 'onboarding@resend.dev';
    this.frontendUrl =
      this.config.get<string>('FRONTEND_URL') || 'http://localhost:3000';

    if (!apiKey) {
      this.logger.warn(
        '⚠️  RESEND_API_KEY not found. Email sending will be disabled.',
      );
      return;
    }

    this.resend = new Resend(apiKey);
    this.logger.log('✅ Resend email service initialized');
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(
    to: string,
    resetToken: string,
    userName?: string,
  ): Promise<void> {
    if (!this.resend) {
      this.logger.warn('Email service not initialized. Skipping email send.');
      return;
    }

    const resetLink = `${this.frontendUrl}/auth/reset-password?token=${resetToken}`;

    try {
      const { data, error } = await this.resend.emails.send({
        from: this.fromEmail,
        to,
        subject: 'Reset Your Password - Quarter Real Estate',
        html: this.getPasswordResetTemplate(resetLink, userName),
      });

      if (error) {
        this.logger.error('Failed to send password reset email:', error);
        throw error;
      }

      this.logger.log(`✅ Password reset email sent to: ${to}`);
      this.logger.debug(`Email ID: ${data?.id}`);
    } catch (error) {
      this.logger.error('Error sending password reset email:', error);
      throw error;
    }
  }

  /**
   * Send welcome email after registration
   */
  async sendWelcomeEmail(to: string, userName: string): Promise<void> {
    if (!this.resend) {
      this.logger.warn('Email service not initialized. Skipping email send.');
      return;
    }

    try {
      const { data, error } = await this.resend.emails.send({
        from: this.fromEmail,
        to,
        subject: 'Welcome to Quarter Real Estate! 🏡',
        html: this.getWelcomeTemplate(userName),
      });

      if (error) {
        this.logger.error('Failed to send welcome email:', error);
        throw error;
      }

      this.logger.log(`✅ Welcome email sent to: ${to}`);
      this.logger.debug(`Email ID: ${data?.id}`);
    } catch (error) {
      this.logger.error('Error sending welcome email:', error);
      // Don't throw - welcome email failure shouldn't block registration
    }
  }

  /**
   * Password Reset Email Template
   */
  private getPasswordResetTemplate(
    resetLink: string,
    userName?: string,
  ): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background-color: #ff5a3c; padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">Quarter Real Estate</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              ${userName ? `<p style="margin: 0 0 20px; font-size: 16px; color: #333333;">Hi ${userName},</p>` : ''}
              
              <p style="margin: 0 0 20px; font-size: 16px; color: #333333;">
                We received a request to reset your password for your Quarter Real Estate account.
              </p>
              
              <p style="margin: 0 0 30px; font-size: 16px; color: #333333;">
                Click the button below to reset your password:
              </p>
              
              <!-- Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${resetLink}" 
                       style="display: inline-block; padding: 16px 40px; background-color: #ff5a3c; color: #ffffff; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: bold;">
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 30px 0 20px; font-size: 14px; color: #666666;">
                Or copy and paste this link into your browser:
              </p>
              
              <p style="margin: 0 0 30px; font-size: 14px; color: #ff5a3c; word-break: break-all;">
                ${resetLink}
              </p>
              
              <div style="border-top: 1px solid #eeeeee; padding-top: 20px; margin-top: 30px;">
                <p style="margin: 0 0 10px; font-size: 14px; color: #999999;">
                  ⏱️ This link will expire in <strong>1 hour</strong>.
                </p>
                
                <p style="margin: 0; font-size: 14px; color: #999999;">
                  🔒 If you didn't request a password reset, you can safely ignore this email.
                </p>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f8f8; padding: 30px; text-align: center; border-top: 1px solid #eeeeee;">
              <p style="margin: 0 0 10px; font-size: 14px; color: #999999;">
                Quarter Real Estate
              </p>
              <p style="margin: 0; font-size: 12px; color: #999999;">
                © ${new Date().getFullYear()} All rights reserved.
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;
  }

  /**
   * Welcome Email Template
   */
  private getWelcomeTemplate(userName: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Quarter Real Estate</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background-color: #ff5a3c; padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">Welcome! 🏡</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px; font-size: 18px; color: #333333; font-weight: bold;">
                Hi ${userName},
              </p>
              
              <p style="margin: 0 0 20px; font-size: 16px; color: #333333;">
                Welcome to <strong>Quarter Real Estate</strong>! We're excited to have you on board. 🎉
              </p>
              
              <p style="margin: 0 0 30px; font-size: 16px; color: #333333;">
                Your account has been successfully created. You can now:
              </p>
              
              <ul style="margin: 0 0 30px; padding-left: 20px; font-size: 16px; color: #333333; line-height: 1.8;">
                <li>Browse properties across Angola</li>
                <li>List your properties for sale or rent</li>
                <li>Connect with buyers and sellers</li>
                <li>Save your favorite listings</li>
              </ul>
              
              <!-- Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${this.frontendUrl}" 
                       style="display: inline-block; padding: 16px 40px; background-color: #ff5a3c; color: #ffffff; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: bold;">
                      Start Exploring
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 30px 0 0; font-size: 14px; color: #666666;">
                If you have any questions, feel free to reach out to our support team.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f8f8; padding: 30px; text-align: center; border-top: 1px solid #eeeeee;">
              <p style="margin: 0 0 10px; font-size: 14px; color: #999999;">
                Quarter Real Estate
              </p>
              <p style="margin: 0; font-size: 12px; color: #999999;">
                © ${new Date().getFullYear()} All rights reserved.
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;
  }
}
