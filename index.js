require('dotenv').config();
const express = require('express');
const axios = require('axios');
const VoiceResponse = require('twilio').twiml.VoiceResponse;
const fs = require('fs');
const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.post('/voice', async (req, res) => {
  const twiml = new VoiceResponse();
  const userInput = "Berätta om Teamfresh.";

  try {
    // Steg 1: Hämta GPT-svar
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

    // Steg 2: Skicka texten till ElevenLabs för att få ljudfil
    const audioRes = await axios.post(
      'https://api.elevenlabs.io/v1/text-to-speech/nj2kDceTt5kBFLmcz5F5', // Astrid (svenska)
      {
        text,
        voice_settings: {
          stability: 0.4,
          similarity_boost: 0.75
        }
      },
      {
        headers: {
          'xi-api-key': process.env.ELEVEN_API_KEY,
          'Content-Type': 'application/json',
          'Accept': 'audio/mpeg',
        },
        responseType: 'arraybuffer',
      }
    );

    const audioBuffer = Buffer.from(audioRes.data, 'binary');

    // Steg 3: Spara temporär fil
    const filePath = `/tmp/response.mp3`;
    fs.writeFileSync(filePath, audioBuffer);

    // Steg 4: TwiML – spela upp ljudet
    const twimlResponse = new VoiceResponse();
    twimlResponse.play({}, 'https://teamfresh-ai.onrender.com/audio');

    res.type('text/xml');
    res.send(twimlResponse.toString());

  } catch (err) {
    console.error(err);
    const fail = new VoiceResponse();
    fail.say('Något gick fel.');
    res.type('text/xml');
    res.send(fail.toString());
  }
});

// Endpoint som Twilio kan hämta MP3 från
app.get('/audio', (req, res) => {
  const path = '/tmp/response.mp3';
  res.set('Content-Type', 'audio/mpeg');
  fs.createReadStream(path).pipe(res);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 AI-svar lyssnar på port ${PORT}`));

