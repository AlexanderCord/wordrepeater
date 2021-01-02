import * as express from 'express';
import IController from './icontroller';
 
class IndexController implements IController{
  public path = '/';
  public router = express.Router();
 
  constructor() {
    this.intializeRoutes();
  }
 
  public intializeRoutes() {
    this.router.get(this.path, this.index);
  }
  
  index = async (req: express.Request, res: express.Response): Promise<void> => {
    let userEmail = req.session.userEmail;
    res.render('index', { title: 'WordRepeater', userEmail: userEmail});
  }
  
}
 
export default IndexController;



