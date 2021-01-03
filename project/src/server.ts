import App from './main';
import IndexController from './controllers/index';
 
const app = new App(
  [
    new IndexController(),
  ],
  5000,
);
 
app.listen();
