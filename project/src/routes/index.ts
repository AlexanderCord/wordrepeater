import {Router} from 'express'
//import { index } from '../controllers/index' 
import {indexController} from '../controllers/index';

const indexRouter = Router()
/* GET home page. */
indexRouter.get('/', indexController);

export { indexRouter };
