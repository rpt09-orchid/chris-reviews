const fs = require('fs');
const request = require('request');
const path = require('path');
const s3Upload = require('../services/aws');
const _ = require('lodash');

module.exports = {
  readFile: function(filename) {
    return new Promise((resolve, reject) => {
      fs.readFile(filename, 'utf8', function(err, data) {
        if (err) {
          reject(err);
        } else {
          console.log('OK: ' + filename);
          // console.log(data);
          resolve(data);
        }
      });
    })
  },
  download: function(url, filename, callback) {
    request.head(url, (err, res, body) => {
      request(url).pipe(fs.createWriteStream(filename)).on('close', callback);
    });
  },
  saveImagesAndS3Upload: function(text) {
    return new Promise((resolve, reject) => {
      const images = text.split('\n');
      const dir = path.join(__dirname, '../images/');
      const s3Urls = {};
      const imageInsertions = images.map((image, index) => {
        return new Promise((resolve, reject) => {
          let filePath = dir + 'pet_' + (index + 1) + '.jpg';
          this.download(images[index], filePath, () => {
            s3Upload(filePath)
              .then((url) => {
                s3Urls[index + 1] = url;
                resolve();
              })
              .catch(err => {
                reject('S3 error:' + err);
              });
          });
        });
      });
      Promise.all(imageInsertions).then(() => {
        resolve({
          s3Urls, 
          maxUrls: images.length
        });
      });
    });
  },
  getRandomUrls: function({s3Urls, maxUrls}, users) {
    const urls = [];
    for (let i = 0; i < users; i++) {
      let randNum = _.random(1, maxUrls);
      urls.push(s3Urls[randNum]);
    }
    return urls;
  }
}