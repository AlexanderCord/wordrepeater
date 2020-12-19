const expect = require("chai").expect;
const chai = require('chai');
const chaiHttp = require('chai-http');
const config = require('../config');
for (let u in config.basic.users) {
  var user = u;
  var pass = config.basic.users[user]
  break;
}

//console.log(user)
//console.log(pass);
var auth = 'Basic ' + Buffer.from(user + ':' + pass).toString('base64');
//console.log(auth);

chai.use(chaiHttp);

var testWord = 'Test Word ' + Math.random();
var testWordTranslation = 'Test Word Translation ' + Math.random();
var testWordId = '';
console.log(testWord);
console.log(testWordTranslation);


describe('Adding and removing words', function() {
  let host = "http://localhost:3000";
  let path = "/vocabulary/words";

  it('should save words to : /vocabulary/words POST', async function() {
    try {
      const response = await chai
        .request(host)
        .post(path)
        //            .field('original' , 'test word')
        //            .field('translation', 'test word translation')
        //            .set('content-type', 'application/x-www-form-urlencoded')
        //            .send()
        //            .set()

        .set('Authorization', auth)
        .send({
          original: testWord,
          translation: testWordTranslation
        });

      //console.log(response);
      let html = response.res.text;
      if (html.length > 0) {
        let reg = new RegExp('/vocabulary/word/(.+)">' + testWord);
        let tempWordId = reg.exec(html)[1];
        if (typeof tempWordId !== 'undefined') {
          testWordId = tempWordId;
          console.log('test word id = ' + testWordId);

          console.log('Removing word');
          path = "/vocabulary/word/" + testWordId + '?_method=DELETE';


          const response2 = await chai
            .request(host)
            .post(path)
            .set('Authorization', auth)


          let html = response2.res.text;
          console.log(html.length);
          if (html.length > 0) {
            console.log('Test removal ok');
          } else {
            console.log('Test removal error');
          }




        }
      }
      if (testWordId.length == 0) {
        console.log('Test error');
      }

    } catch (e) {
      console.log('Test error');
      console.log(e);
    }

  });
});


