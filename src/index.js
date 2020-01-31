import { promises as _ } from 'fs';
import { resolve, join } from 'path';
// import { homedir } from 'os';
import axios from 'axios';

const writeToFile = (dirPath, fileName, data) => {
  const filePath = join(dirPath, fileName);

  return _
    .mkdir(dirPath, { recursive: true })
    .then(() => _.writeFile(filePath, data))
    .then(() => filePath);
};

export default (address, outputPath) => {
  const fileName = `${/\/\/(.*)/.exec(address)[1].replace(/\W/g, '-')}.html`;
  const fullPath = resolve(process.cwd(), outputPath || '');

  return axios.get(address)
    .then(({ data }) => writeToFile(fullPath, fileName, data))
    .then((filePath) => filePath);
};
