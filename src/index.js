import { promises as _ } from 'fs';
import { resolve, join, parse } from 'path';
import axios from 'axios';
import cheerio from 'cheerio';
import debug from 'debug';

const logInfo = debug('page-loader:INFO');
const logBuilder = debug('page-loader:BULDER');
const logError = debug('page-loader:ERROR');

function addLocalAttr() {
  this.fileName = this.reg.exec(this.nick)[1].replace(/\W/g, '-');
  this.fullFileName = `${this.fileName}${this.ext}`;
  this.fullPath = join(this.path, this.fullFileName);
  this.resourcesDir = `${this.fileName}_files`;
  return this;
}

const writeToFile = ({ path, fullPath, content }) => _
  .mkdir(path, { recursive: true })
  .then(() => _.writeFile(fullPath, content));

export default (address, path) => {
  const page = addLocalAttr.apply({
    address,
    path: resolve(process.cwd(), path || ''),
    nick: address,
    reg: /\/\/(.*)/,
    ext: '.html',
    resources: [],
  });
  logBuilder('page constructed %O', page);

  return axios.get(page.address)
    .then(({ data }) => {
      const $ = cheerio.load(data);
      logInfo('page received');

      const srcLocalElements = $("[src^='/']");
      logInfo('local links filtered');

      srcLocalElements.each((i, element) => {
        const src = $(element).attr('src');
        logInfo('processing link %d: %s', i, src);

        const { dir, ext, name } = parse(src);

        const resource = addLocalAttr.apply({
          address: `${(new URL(page.address)).origin}${src}`,
          path: join(page.path, page.resourcesDir),
          nick: `${dir}-${name}`,
          reg: /^\/(.*)/,
          ext,
        });
        logBuilder('local resource constructed %O', resource);

        const localLink = join(page.resourcesDir, resource.fullFileName);
        $(element).attr('src', localLink);
        page.resources.push(resource);
        logInfo('local link changed in HTML with %s', localLink);
      });

      page.content = $.html();

      return writeToFile(page);
    })
    .then(() => Promise.all([...page.resources.map(
      (resource) => axios.get(resource.address, { responseType: 'arraybuffer' })
        .then((response) => {
          logInfo('saving local resource from %s', resource.address);
          return writeToFile({ ...resource, content: response.data });
        }),
    )]))
    .then(() => {
      logInfo('DONE');
      return page;
    })
    .catch((err) => logError(err));
};
