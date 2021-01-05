import App from './app';
import IndexController from './controllers/index';
import TrainController from './controllers/train';
 
const app = new App(
  [
    new IndexController(),
    new TrainController()
  ],
  3000,
);
 
app.listen();
