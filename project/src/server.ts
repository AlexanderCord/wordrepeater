import App from './app';
import IndexController from './controllers/index';
 
const app = new App(
  [
    new IndexController(),
  ],
  3000,
);
 
app.listen();
