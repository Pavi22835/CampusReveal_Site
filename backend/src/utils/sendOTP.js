const twilio = require('twilio');

// Generate random OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// For development - log OTP to console
const sendOTPDev = (phone, otp) => {
  console.log(`\n========== OTP DEBUG ==========`);
  console.log(`📱 Phone: ${phone}`);
  console.log(`🔐 OTP: ${otp}`);
  console.log(`⏰ Valid for 10 minutes`);
  console.log(`================================\n`);
  return true;
};

// For production - send SMS via Twilio
const sendOTPProduction = async (phone, otp) => {
  try {
    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
    
    // Format phone number - use environment variable for country code
    let formattedPhone = phone;
    const countryCode = process.env.SMS_COUNTRY_CODE || '';
    
    if (countryCode && !phone.startsWith('+')) {
      formattedPhone = `${countryCode}${phone}`;
    } else if (!phone.startsWith('+')) {
      // If no country code configured, assume phone already has country code
      formattedPhone = phone;
    }
    
    await client.messages.create({
      body: `Your CampusReveal verification OTP is: ${otp}. Valid for 10 minutes.`,
      to: formattedPhone,
      from: process.env.TWILIO_PHONE_NUMBER
    });
    return true;
  } catch (error) {
    console.error('Twilio error:', error);
    return false;
  }
};

// Main send function
const sendOTP = async (phone, otp) => {
  if (process.env.NODE_ENV === 'production') {
    return await sendOTPProduction(phone, otp);
  } else {
    return sendOTPDev(phone, otp);
  }
};

module.exports = { generateOTP, sendOTP };