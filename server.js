require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const mongoose = require('mongoose');
const {Schema, model} = require('mongoose');

// Basic Configuration
const port = process.env.PORT || 3000;
const mongoURI = process.env.MONGO_URI || "mongouri";

(async () => {
  mongoose
  .connect(`${mongoURI}`)
  .then(() => {
     console.log('Successfully connected to the mongo database.');
  })
  .catch((err) => { console.log(err); })
})()

const shortenURLSchema = new Schema({
  original_url: {type: String},
  short_url: {type: Number}
});

const SHORTEN_URL = model('Shorten URL', shortenURLSchema);

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({ extended: false }));

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.post('/api/shorturl', function(req, res) {
  const { url } = req.body;

  try {
    new URL(url)
  } catch(_) {
    res.json({ error: 'invalid url' })
  }
  
  SHORTEN_URL.count({}, (err, count) => {
    if(err) throw err;
     
    const createURL = new SHORTEN_URL({
      original_url: url,
      short_url: count
    })

    createURL.save((err, done) => {
      if(err) console.log(err);
      const {original_url, short_url} = done;
      res.json({original_url, short_url});
    })
  });
  
});

app.get('/api/shorturl/:short_url', function(req, res) {
  const { short_url } = req.params;
  SHORTEN_URL.findOne({ short_url }, (err, result) => {
    if(err) throw err;
    if(!result) res.json({ error: 'invalid url' });
    res.redirect(result.original_url);
  })

});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
