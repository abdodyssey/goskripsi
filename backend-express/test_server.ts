import express from 'express';
const app = express();
app.get('/', (req, res) => res.send('OK'));
const server = app.listen(4000, () => {
  console.log('Listening on 4000');
  // keep open
});
