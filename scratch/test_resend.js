const { Resend } = require('resend');
require('dotenv').config();

const resend = new Resend(process.env.RESEND_API_KEY);

async function test() {
  try {
    console.log("Testing Resend with API Key:", process.env.RESEND_API_KEY?.substring(0, 5) + "...");
    const { data, error } = await resend.emails.send({
      from: 'GoSkripsi <onboarding@resend.dev>',
      to: 'khalishaalya11@gmail.com',
      subject: 'Test Notification',
      html: '<p>Testing Resend connection</p>',
    });

    if (error) {
      console.error("Resend Error:", error);
    } else {
      console.log("Resend Success:", data);
    }
  } catch (err) {
    console.error("Unexpected Error:", err);
  }
}

test();
