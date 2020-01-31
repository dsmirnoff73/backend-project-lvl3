import nock from 'nock';
// import axios from 'axios';
import { resolve } from 'path';
// import { tmpdir } from 'os';
import { promises as _ } from 'fs';
// import pageLoader from '../src';


test('can fetch test response', async () => {
  const pathToDummyFile = resolve(__dirname, '../__fixtures__/dummypage');
  const data = await _.readFile(pathToDummyFile, 'utf8');
  const address = 'https://hexlet.io/courses';

  console.log('TEST PATHTODUMMY: ', data);
  nock(address)
    .get('/')
    .reply(200, { data });
/*
  const { testKey } = await _.mkdtemp(join(tmpdir(), 'lvl3'))
    .then((outputPath) => pageLoader(address, outputPath))
    .then((filePath) => {
      console.log('TEST: ', filePath);
      _.readFile(filePath, 'utf8');
    })
    .then((content) => JSON.parse(content));

  expect(testKey).toBe('123456789');
*/
});
