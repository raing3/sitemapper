## Sitemap-parser
[![Code Scanning](https://github.com/raing3/sitemapper/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/raing3/sitemapper/actions/workflows/codeql-analysis.yml)
[![NPM Publish](https://github.com/raing3/sitemapper/actions/workflows/npm-publish.yml/badge.svg)](https://github.com/raing3/sitemapper/actions/workflows/npm-publish.yml)
[![Version Bump](https://github.com/raing3/sitemapper/actions/workflows/version-bump.yml/badge.svg?branch=master&event=push)](https://github.com/raing3/sitemapper/actions/workflows/version-bump.yml)
[![Test](https://github.com/raing3/sitemapper/actions/workflows/test.yml/badge.svg?branch=master&event=push)](https://github.com/raing3/sitemapper/actions/workflows/test.yml)
[![GitHub release date](https://img.shields.io/github/release-date/raing3/sitemapper.svg)](https://github.com/raing3/sitemapper/releases)
[![release](https://img.shields.io/github/release/raing3/sitemapper.svg)](https://github.com/raing3/sitemapper/releases/latest)

Parse through a sitemaps xml to get all the urls for your crawler.

Forked from: https://github.com/seantomburke/sitemapper

Notable changes:

 * TS declarations more accurate.
 * Fetch will return all properties of a sitemap entry instead of just the URL.
 * Invalid properties from sitemap entries will be returned as undefined.
 * Requires Node 20+.

### Installation
```bash
npm install @raing3/sitemapper --save
```

### Example
```javascript
import Sitemapper from '@raing3/sitemapper';

(async () => {
  const Google = new Sitemapper({
    url: 'https://www.google.com/work/sitemap.xml',
    timeout: 15000, // 15 seconds
  });

  try {
    const { sites } = await Google.fetch();
    console.log(sites);
  } catch (error) {
    console.log(error);
  }
})();

// or

const sitemapper = new Sitemapper();
sitemapper.timeout = 5000;

sitemapper.fetch('https://wp.seantburke.com/sitemap.xml')
  .then(({ url, sites }) => console.log(`url:${url}`, 'sites:', sites))
  .catch(error => console.log(error));
```

# Options

You can add options on the initial Sitemapper object when instantiating it.

+ `requestHeaders`: (Object) - Additional Request Headers (e.g. `User-Agent`)
+ `timeout`: (Number) - Maximum timeout in ms for a single URL. Default: 15000 (15 seconds)
+ `url`: (String) - Sitemap URL to crawl
+ `debug`: (Boolean) - Enables/Disables debug console logging. Default: False
+ `concurrency`: (Number) - Sets the maximum number of concurrent sitemap crawling threads. Default: 10
+ `retries`: (Number) - Sets the maximum number of retries to attempt in case of an error response (e.g. 404 or Timeout). Default: 0
+ `rejectUnauthorized`: (Boolean) - If true, it will throw on invalid certificates, such as expired or self-signed ones. Default: True
+ `lastmod`: (Number) - Timestamp of the minimum lastmod value allowed for returned urls
+ `fields` : (Array) - An array of fields to be returned from the sitemap. For Example: `["loc", "lastmod", "changefreq", "priority"]`. Leaving a field out will return all standard fields.

```javascript
const sitemapper = new Sitemapper({
  url: 'https://art-works.community/sitemap.xml',
  rejectUnauthorized: true,
  timeout: 15000,
  requestHeaders: {
    'User-Agent': 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:81.0) Gecko/20100101 Firefox/81.0'
  }
});

```

An example using all available options:

```javascript
const sitemapper = new Sitemapper({
  url: 'https://art-works.community/sitemap.xml',
  timeout: 15000,
  requestHeaders: {
    'User-Agent': 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:81.0) Gecko/20100101 Firefox/81.0'
  },
  debug: true,
  concurrency: 2,
  retries: 1,
});
```
