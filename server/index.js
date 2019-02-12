require('../newrelic');
const app = require('./app.js');
//setup env variavles
require('dotenv').config();
 
const port = process.env.PORT || 3003;
 
app.listen(port, () => {
  console.log(`listening on port ${port}`);
  console.log('host: ', process.env.HOST);
});
 
module.exports = app;