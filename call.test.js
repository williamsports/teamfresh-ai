const twilio = require('twilio');

const client = new twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

client.calls
  .create({
    url: 'https://teamfresh-ai.onrender.com',
    to: '+46735112146',
    from: '+12513177962',
  })
  .then(call => console.log('Samtal skickat! SID:', call.sid))
  .catch(error => console.error('Fel:', error));
