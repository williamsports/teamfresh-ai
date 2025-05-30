require('dotenv').config();
const express = require('express');
const axios = require('axios');
const { VoiceResponse } = require('twilio').twiml;

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.post('/voice', async (req, res) => {
  const twiml = new VoiceResponse();

  const userInput = "Berätta kort om Teamfresh – varför det är bra för klubbar och skolklasser att sälja schampo istället för kakor.";

  try {
    const gptRes = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: userInput }],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const text = gptRes.data.choices[0].message.content;

    const gather = twiml.gather({ input: 'speech', timeout: 3 });
    gather.say({ language: 'sv-SE' }, text); // Twilio's standard Swedish voice

    res.type('text/xml');
    res.send(twiml.toString());
  } catch (err) {
    console.error(err);
    twiml.say({ language: 'sv-SE' }, 'Något gick fel, försök igen.');
    res.type('text/xml');
    res.send(twiml.toString());
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server kör på port ${PORT}`));

