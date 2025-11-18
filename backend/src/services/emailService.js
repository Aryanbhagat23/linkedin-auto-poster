const nodemailer = require('nodemailer');
const config = require('../config/config');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: config.email.user,
    pass: config.email.password,
  },
});

async function sendPostNotification(post, status) {
  try {
    const mailOptions = {
      from: config.email.user,
      to: config.email.user,
      subject: `LinkedIn Post ${status === 'success' ? 'Published' : 'Failed'} - ${new Date().toLocaleDateString()}`,
      html: `
        <h2>LinkedIn Auto-Poster Notification</h2>
        <p><strong>Status:</strong> ${status === 'success' ? '✅ Successfully Posted' : '❌ Failed to Post'}</p>
        <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
        <hr>
        <h3>Post Content:</h3>
        <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; white-space: pre-wrap;">
${post.content}
        </div>
        <hr>
        <p><strong>Word Count:</strong> ${post.wordCount || 'N/A'}</p>
        ${status === 'error' ? `<p><strong>Error:</strong> ${post.error}</p>` : ''}
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('Email notification sent');
  } catch (error) {
    console.error('Email Error:', error);
  }
}

module.exports = { sendPostNotification };