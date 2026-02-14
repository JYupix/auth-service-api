export const verificationEmailTemplate = (verificationUrl: string, username: string) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your Email</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f7;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f7; padding: 40px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
              
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; border-radius: 8px 8px 0 0;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">Welcome${username ? `, ${username}` : ''}!</h1>
                </td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="padding: 40px 40px 20px 40px;">
                  <h2 style="margin: 0 0 20px 0; color: #1a1a1a; font-size: 20px; font-weight: 600;">Verify Your Email Address</h2>
                  <p style="margin: 0 0 20px 0; color: #4a5568; font-size: 16px; line-height: 1.6;">
                    Thanks for signing up! To complete your registration and start using your account, please verify your email address by clicking the button below.
                  </p>
                  <p style="margin: 0 0 30px 0; color: #718096; font-size: 14px; line-height: 1.6;">
                    This link will expire in <strong>24 hours</strong> for security reasons.
                  </p>
                </td>
              </tr>

              <!-- Button -->
              <tr>
                <td align="center" style="padding: 0 40px 40px 40px;">
                  <a href="${verificationUrl}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);">
                    Verify Email Address
                  </a>
                </td>
              </tr>

              <!-- Alternative Link -->
              <tr>
                <td style="padding: 0 40px 30px 40px; border-top: 1px solid #e2e8f0;">
                  <p style="margin: 20px 0 10px 0; color: #718096; font-size: 14px; line-height: 1.6;">
                    If the button above doesn't work, copy and paste this link into your browser:
                  </p>
                  <p style="margin: 0; word-break: break-all;">
                    <a href="${verificationUrl}" style="color: #667eea; text-decoration: none; font-size: 13px;">${verificationUrl}</a>
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="padding: 30px 40px; background-color: #f7fafc; border-radius: 0 0 8px 8px; text-align: center;">
                  <p style="margin: 0 0 10px 0; color: #a0aec0; font-size: 13px;">
                    If you didn't create an account, you can safely ignore this email.
                  </p>
                  <p style="margin: 0; color: #cbd5e0; font-size: 12px;">
                    © ${new Date().getFullYear()} Your App Name. All rights reserved.
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
};

export const welcomeEmailTemplate = (username: string | null, loginUrl: string) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome!</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f7;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f7; padding: 40px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
              
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; border-radius: 8px 8px 0 0;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 600;">🎉 Welcome Aboard!</h1>
                </td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="padding: 40px 40px 20px 40px;">
                  <h2 style="margin: 0 0 20px 0; color: #1a1a1a; font-size: 24px; font-weight: 600;">
                    ${username ? `Hey ${username}!` : 'Hello!'}
                  </h2>
                  <p style="margin: 0 0 20px 0; color: #4a5568; font-size: 16px; line-height: 1.6;">
                    Your email has been successfully verified! You're all set to start using your account.
                  </p>
                  <p style="margin: 0 0 30px 0; color: #718096; font-size: 16px; line-height: 1.6;">
                    We're excited to have you on board. Click the button below to log in and get started.
                  </p>
                </td>
              </tr>

              <!-- CTA Button -->
              <tr>
                <td align="center" style="padding: 0 40px 40px 40px;">
                  <a href="${loginUrl}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);">
                    Log In to Your Account
                  </a>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="padding: 30px 40px; background-color: #f7fafc; border-radius: 0 0 8px 8px; text-align: center;">
                  <p style="margin: 0 0 10px 0; color: #a0aec0; font-size: 13px;">
                    Need help? Contact us at <a href="mailto:support@yourapp.com" style="color: #667eea; text-decoration: none;">support@yourapp.com</a>
                  </p>
                  <p style="margin: 0; color: #cbd5e0; font-size: 12px;">
                    © ${new Date().getFullYear()} Your App Name. All rights reserved.
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
};

export const passwordResetEmailTemplate = (resetUrl: string, username: string) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your Password</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f7;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f7; padding: 40px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
              
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 40px; text-align: center; border-radius: 8px 8px 0 0;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">Password Reset</h1>
                </td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="padding: 40px 40px 20px 40px;">
                  <h2 style="margin: 0 0 20px 0; color: #1a1a1a; font-size: 20px; font-weight: 600;">Reset Your Password</h2>
                  <p style="margin: 0 0 20px 0; color: #4a5568; font-size: 16px; line-height: 1.6;">
                    ${username ? `Hi ${username}, ` : ''}We received a request to reset your password. Click the button below to create a new password.
                  </p>
                  <p style="margin: 0 0 30px 0; color: #718096; font-size: 14px; line-height: 1.6;">
                    This link will expire in <strong>1 hour</strong> for security reasons.
                  </p>
                </td>
              </tr>

              <!-- Button -->
              <tr>
                <td align="center" style="padding: 0 40px 40px 40px;">
                  <a href="${resetUrl}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(245, 87, 108, 0.4);">
                    Reset Password
                  </a>
                </td>
              </tr>

              <!-- Alternative Link -->
              <tr>
                <td style="padding: 0 40px 30px 40px; border-top: 1px solid #e2e8f0;">
                  <p style="margin: 20px 0 10px 0; color: #718096; font-size: 14px; line-height: 1.6;">
                    If the button above doesn't work, copy and paste this link into your browser:
                  </p>
                  <p style="margin: 0; word-break: break-all;">
                    <a href="${resetUrl}" style="color: #f5576c; text-decoration: none; font-size: 13px;">${resetUrl}</a>
                  </p>
                </td>
              </tr>

              <!-- Security Notice -->
              <tr>
                <td style="padding: 30px 40px; background-color: #fff5f5; border-radius: 0 0 8px 8px;">
                  <p style="margin: 0 0 10px 0; color: #c53030; font-size: 13px; font-weight: 600;">
                    ⚠️ Security Notice
                  </p>
                  <p style="margin: 0 0 10px 0; color: #742a2a; font-size: 13px; line-height: 1.6;">
                    If you didn't request a password reset, please ignore this email or contact support if you have concerns.
                  </p>
                  <p style="margin: 0; color: #cbd5e0; font-size: 12px;">
                    © ${new Date().getFullYear()} Your App Name. All rights reserved.
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
};