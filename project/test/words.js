const expect = require("chai").expect;
const chai = require('chai');
const chaiHttp = require('chai-http');
const config = require('../dist/config');
//console.log(auth);
var assert = require('assert');
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

        .set('Auth', config.auth.client_secret)
        .send({
          original: testWord,
          translation: testWordTranslation
        });
      //console.log(response);
      let html = response.res.text;
      expect(html).not.to.be.empty;
      let redirectUrl = response.redirects[0].toString();
      console.log(redirectUrl);
      expect(redirectUrl).to.have.string('added');
      //assert.include(response.redirects[0], 'added', 'added word assert');
      //expect(response.redirects[0].toString()).to.have.string('added');;
    //  expect(response.redirects[0].to.have.string('added'));
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
            .set('Auth', config.auth.client_secret)


          let html2 = response2.res.text;
          //console.log(html2);
          expect(html2).not.to.be.empty;
          let redirectUrl2 = response2.redirects[0].toString();
          console.log(redirectUrl2);
          expect(redirectUrl2).to.have.string('removed');

          if (html.length > 0) {
            console.log('Test removal ok');
          } else {
            console.log('Test removal error');
            throw new Error();
          }



        }
      }
      if (testWordId.length == 0) {
        console.log('Test error');
        throw new Error();
      }

    } catch (e) {
      console.log('Test error');
      console.log(e);
      throw new Error();
    }

    
  });
});

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

describe('Testing training modes', function() {
  let host = "http://localhost:3000";
  let path = "/train";
  
  beforeEach(async function () { 
    await wait(500);
    console.log('pausing');
  });

  it('should return words with score 0.9 and less in default mode /train/default', async function() {
    try {
      const response = await chai
        .request(host)
        .get(path + '/default')

        .set('Auth', config.auth.client_secret)
        .query({
          word_id: '',
          train_result: 'skip'
        });
      let html = response.res.text;
      //console.log(html);
      expect(html).not.to.be.empty;
      if (html.length > 0 && JSON.parse(html)) {
        let wordObj = JSON.parse(html);
        console.log(wordObj.result);;
        expect(wordObj.result).to.have.property('word_original');
        expect(wordObj.result).to.have.property('word_translation');
        expect(wordObj.result).to.have.property('train_stats');
        expect(wordObj.result.train_stats.success_rate*100).not.to.be.above(90);
      }

    } catch (e) {
      console.log('Test error');
      console.log(e);
      throw new Error();
    }
      
  });
  
  it('should return only new words in new mode /train/new', async function() {
    try {
      const response = await chai
        .request(host)
        .get(path + '/new')

        .set('Auth', config.auth.client_secret)
        .query({
          word_id: '',
          train_result: 'skip'
        });
      //console.log(response);
      let html = response.res.text;
      expect(html).not.to.be.empty;
      if (html.length > 0 && JSON.parse(html)) {
        let wordObj = JSON.parse(html);
        console.log(wordObj.result);;
        expect(wordObj.result).to.have.property('word_original');
        expect(wordObj.result).to.have.property('word_translation');
        expect(wordObj.result).not.to.have.property('train_stats');
      }

    } catch (e) {
      console.log('Test error');
      console.log(e);
      throw new Error();
    }
    
      
  });  
  
  it('should return all words in mode /train/all', async function() {
    try {
      const response = await chai
        .request(host)
        .get(path + '/new')

        .set('Auth', config.auth.client_secret)
        .query({
          word_id: '',
          train_result: 'skip'
        });
      //console.log(response);
      let html = response.res.text;
      expect(html).not.to.be.empty;
      if (html.length > 0 && JSON.parse(html)) {
        let wordObj = JSON.parse(html);
        console.log(wordObj.result);;
        expect(wordObj.result).to.have.property('word_original');
        expect(wordObj.result).to.have.property('word_translation');
      }

    } catch (e) {
      console.log('Test error');
      console.log(e);
      throw new Error();
    }
    
      
  });  
  
});



describe('Testing training log', function() {
  let host = "http://localhost:3000";
  let path = "/train";
  
  beforeEach(async function () { 
    await wait(500);
    console.log('pausing');
  });

  it('should return correct log by default /train/log', async function() {
    try {
      const response = await chai
        .request(host)
        .get(path + '/log')

        .set('Auth', config.auth.client_secret)
        .query({
          
        });
      let html = response.res.text;
      //console.log(html);
      expect(html).not.to.be.empty;
      expect(html).to.have.string('- no');
      expect(html).to.have.string('- yes');      

    } catch (e) {
      console.log('Test error');
      console.log(e);
      throw new Error();
    }
      
  });

  it('should return no logs in the future /train/log/filter', async function() {
    try {
      const response = await chai
        .request(host)
        .get(path + '/log/filter')

        .set('Auth', config.auth.client_secret)
        .query({
           date: '2030-01-01'
        });
      let html = response.res.text;
      //console.log(html);
      expect(html).not.to.be.empty;
      if (html.length > 0 && JSON.parse(html)) {
        let rowsObj = JSON.parse(html);
        console.log(rowsObj.result);;
        expect(rowsObj.result.log).to.be.empty;
        
      }     

    } catch (e) {
      console.log('Test error');
      console.log(e);
      throw new Error();
    }
      
  });  
  it('should return some logs in the future /train/log/all', async function() {
    try {
      const response = await chai
        .request(host)
        .get(path + '/log/all')

        .set('Auth', config.auth.client_secret)
        .query({
            
        });
      let html = response.res.text;
      //console.log(html);
      expect(html).not.to.be.empty;
      if (html.length > 0 && JSON.parse(html)) {
        let rowsObj = JSON.parse(html);
        console.log(rowsObj.result);;
        expect(rowsObj.result.log).not.to.be.empty;
        expect(rowsObj.result.log).lengthOf.above(0);
      }     

    } catch (e) {
      console.log('Test error');
      console.log(e);
      throw new Error();
    }
      
  });  
  
});