const { Resend } = require('resend');

// Initialize Resend with the API Key from env
const resend = new Resend(process.env.RESEND_API_KEY);

const sendConfirmationEmail = async (userEmail, userName) => {
  try {
    console.log(`[Email Service] Attempting to send email to: ${userEmail}`);
    const data = await resend.emails.send({
      from: 'SnapJobs <onboarding@resend.dev>', // Default testing domain
      to: [userEmail], // Warning: In free/test mode, this must be YOUR verified email
      subject: 'Cont creat cu succes! 🎉',
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
            <h1 style="color: #29b6f6;">Salut, ${userName}!</h1>
            <p style="font-size: 16px;">Contul tău a fost creat cu succes pe platforma <strong>SnapJobs</strong>.</p>
            <p style="font-size: 16px;">Acum te poți autentifica și poți începe să aplici la joburi sau să postezi anunțuri.</p>
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #888; font-size: 12px;">
                <p>Echipa SnapJobs</p>
            </div>
        </div>
      `
    });
    console.log('Email confirmation sent:', data);
    return data;
  } catch (error) {
    console.error("Error sending email:", error);
    // Don't crash the request if email fails
    return null; 
  }
};

module.exports = { sendConfirmationEmail };