import { Response, Request } from 'express'
var express = require('express');
var router = express.Router();

/* GET home page. */
const indexController = async (req: Request, res: Response): Promise<void> => {
  res.render('index', { title: 'WordRepeater' });
}

export { indexController };
