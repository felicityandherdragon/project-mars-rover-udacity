require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/', express.static(path.join(__dirname, '../public')));

//ANCHOR: API calls
//NOTE: get mission manifest
app.get('/mars/:rover', async (req, res) => {
  const rover = req.params.rover;
  try {
    let roverInfo = await fetch(
      `https://api.nasa.gov/mars-photos/api/v1/manifests/${rover}?api_key=${process.env.API_KEY}`
    ).then((res) => res.json());
    res.send({ roverInfo });
  } catch (err) {
    console.log('error:', err);
  }
});

//NOTE: Mars rover images by rover and by the sol date specified
app.get('/mars/:rover/:dateType/:date', async (req, res) => {
  const rover = req.params.rover;
  const dateType = req.params.dateType === 'sol' ? 'sol' : 'earth_date';
  const date = req.params.date;

  try {
    let marsImage = await fetch(
      `https://api.nasa.gov/mars-photos/api/v1/rovers/${rover}/photos?${dateType}=${date}&api_key=${process.env.API_KEY}`
    ).then((res) => res.json());
    res.send({ marsImage });
  } catch (err) {
    console.log('error:', err);
  }
});

app.listen(port, () => console.log(`Listening on port ${port}!`));
