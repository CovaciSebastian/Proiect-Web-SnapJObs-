const { Resend } = require("resend");

const apiKey = process.env.RESEND_API_KEY;

let resend = null;

if (apiKey) {
  resend = new Resend(apiKey);
  console.log("Resend email service enabled");
} else {
  console.warn("RESEND_API_KEY missing - email sending disabled");
}

async function sendEmail({ to, subject, html, from }) {
  if (!resend) {
    console.warn("Email skipped (Resend not configured)", { to, subject });
    return;
  }

  return resend.emails.send({
    from: from || "SnapJobs <no-reply@snapjobs.live>",
    to: Array.isArray(to) ? to : [to],
    subject,
    html,
  });
}

// Compat: dacă în cod există sendConfirmationEmail
async function sendConfirmationEmail(userEmail, confirmationLink) {
  return sendEmail({
    to: userEmail,
    subject: "Confirmare cont SnapJobs",
    html: `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
        <h1 style="color: #29b6f6;">Confirmare cont</h1>
        <p>Click pe butonul de mai jos pentru a confirma contul:</p>
        <a href="${confirmationLink}" style="display: inline-block; background-color: #29b6f6; color: #000; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Confirmă contul</a>
      </div>
    `,
  });
}

async function sendPasswordResetEmail(userEmail, resetLink) {
  return sendEmail({
    to: userEmail,
    subject: "Resetare Parolă SnapJobs",
    html: `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
          <h1 style="color: #29b6f6;">Resetare Parolă</h1>
          <p>Ai solicitat resetarea parolei pentru contul tău SnapJobs.</p>
          <p>Click pe butonul de mai jos pentru a seta o nouă parolă:</p>
          <a href="${resetLink}" style="display: inline-block; background-color: #29b6f6; color: #000; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Resetează Parola</a>
          <p style="font-size: 12px; margin-top: 20px;">Acest link expiră în 1 oră.</p>
          <p style="font-size: 12px; color: #888;">Dacă nu ai solicitat acest lucru, ignoră acest email.</p>
      </div>
    `,
  });
}

module.exports = {
  sendEmail,
  sendConfirmationEmail,
  sendPasswordResetEmail,
};
