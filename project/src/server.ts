import App from './app';
import IndexController from './controllers/index';
import TrainController from './controllers/train';
import WordsController from './controllers/words'
 
const app = new App(
  [
    new IndexController(),
    new TrainController(),
    new WordsController()
  ],
  3000,
);
 
app.listen();
