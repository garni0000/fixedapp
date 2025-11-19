import nodemailer from 'nodemailer';
import env from '../config/env';
import logger from './logger';

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS
  }
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async ({ to, subject, html }: EmailOptions) => {
  await transporter.sendMail({
    from: env.EMAIL_FROM,
    to,
    subject,
    html
  });
};

export const sendPasswordResetEmail = async (email: string, token: string) => {
  const resetUrl = `${env.APP_URL}/reset-password?token=${token}`;
  const html = `
    <h2>Réinitialisation du mot de passe</h2>
    <p>Vous avez demandé à réinitialiser votre mot de passe FixedPronos.</p>
    <p><a href="${resetUrl}">Cliquez ici pour réinitialiser votre mot de passe</a>. Ce lien expirera dans 1 heure.</p>
    <p>Si vous n'êtes pas à l'origine de cette demande, ignorez cet e-mail.</p>
  `;

  try {
    await sendEmail({
      to: email,
      subject: 'FixedPronos - Réinitialisation du mot de passe',
      html
    });
    logger.info({ email }, 'Password reset email sent');
  } catch (error) {
    logger.error({ error }, 'Failed to send password reset email');
    throw error;
  }
};

