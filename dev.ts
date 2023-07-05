import polka from 'polka';
const send = require('@polka/send-type');
import { runInternal } from './main/index';
import path from "path";
import cors from 'cors';

const app = polka()
  .use(cors());

app.get('*', async (req, res) => {
  console.log('req', req.url)
  try {
    const result = await runInternal(
      req.url.slice(1) || '',
      req.query,
      req.body,
      req.params);
    send(res, 200, result.body);
  } catch (error) {
      console.log('error', error)
      send(res, 200, { error });
  }
});

app.listen(3000, err => {
  if (err) throw err;
  console.log(`> Running on localhost:3000`);
});