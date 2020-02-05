import { promises as _ } from 'fs';
import { resolve, join, parse } from 'path';
import axios from 'axios';
import cheerio from 'cheerio';

const writeToFile = ({ path, localLink, content }) => _
  .mkdir(path, { recursive: true })
  .then(() => _.writeFile(localLink, content));


const buildName = (string, reg) => reg.exec(string)[1].replace(/\W/g, '-');

export default (address, _path) => {
  const page = {
    address,
    path: resolve(process.cwd(), _path || ''),
    name: buildName(address, /\/\/(.*)/),
    extension: '.html',
    resources: [],

    get resourcesDir() {
      return `${this.name}_files`;
    },
    get fileName() {
      return `${this.name}${this.extension}`;
    },
    get localLink() {
      return join(this.path, this.fileName);
    },
  };

  return axios.get(page.address)
    .then(({ data }) => {
      const $ = cheerio.load(data);
      const srcLocalElements = $("[src^='/']");

      srcLocalElements.each((i, element) => {
        const link = $(element).attr('src');
        const { dir, ext, name } = parse(link);

        const resource = {
          address: `${(new URL(address)).origin}${link}`,
          path: join(page.path, page.resourcesDir),
          name: buildName(`${dir}-${name}`, /^\/(.*)/),
          extension: ext,

          get fileName() {
            return `${this.name}${this.extension}`;
          },
          get localLink() {
            return join(this.path, this.fileName);
          },
        };

        $(element).attr('src', join(page.resourcesDir, resource.fileName));
        page.resources.push(resource);
      });

      page.content = $.html();

      return Promise.all([
        writeToFile(page),
        ...page.resources.map((resource) => axios
          .get(resource.address, { responseType: 'arraybuffer' })
          .then((response) => writeToFile({ ...resource, content: response.data }))),
      ]);
    })
    .then(() => page)
    .catch((err) => console.log(err));
};
