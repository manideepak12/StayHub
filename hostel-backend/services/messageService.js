require('dotenv').config(); // ✅ MISSING LINE FIXED!
const twilio = require('twilio');

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const sendWhatsApp = async (to, body) => {
  try {
    console.log("Sending WhatsApp message to:", `whatsapp:${to}`);
    console.log("Message Body:", body);

    await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_NUMBER,
      to: `whatsapp:${to}`,
      body,
    });

    console.log("✅ WhatsApp message sent successfully!");
  } catch (error) {
    console.error("❌ Failed to send WhatsApp message:", error.message);
  }
};

module.exports = { sendWhatsApp };
