const twilio = require('twilio');

const client = new twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

client.calls
  .create({
    url: 'https://teamfresh-ai.onrender.com', // 🔁 Byt ut mot din riktiga URL!
    to: '+46735112146',         // 🔁 Ditt riktiga svenska nummer (börja med +46)
    from: '+12513177962',       // ✅ Ditt Twilio-nummer (US)
  })
  .then(call => console.log('Samtal skickat! SID:', call.sid))
  .catch(error => console.error('Fel:', error));
