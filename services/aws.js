const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

AWS.config.update({
  //AWS Keys
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  region: 'us-east-1' // region of your bucket
});

const s3 = new AWS.S3();

const s3Upload = (filepath) => {
  const params = {
    Bucket: process.env.AWS_BUCKET,
    Body: fs.createReadStream(filepath),
    Key: 'petImages/' + Date.now() + '_' + path.basename(filepath)
  };

  return new Promise((resolve, reject) => {
    s3.upload(params, (err, data) => {
      if (err) {
        reject(err);
      } else {
        console.log('upload in: ', data.Location);
        resolve(data.Location);
      }
    });
  });
}

module.exports = s3Upload;
