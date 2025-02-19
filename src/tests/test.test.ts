import { beforeEach, describe, expect, it, vi } from 'vitest';
import isUrl from 'is-url';
import { fileURLToPath } from 'url';
import path from 'path';
import got from 'got';
import fs from 'fs';

// @ts-ignore
import Sitemapper from '../../lib/assets/sitemapper.js';
let sitemapper: Sitemapper;

describe('Sitemapper', function () {
  const dirname = fileURLToPath(new URL('.', import.meta.url));

  beforeEach(() => {
    sitemapper = new Sitemapper();
  });

  describe('Sitemapper Class', function () {

    it('should have initializeTimeout method', () => {
      expect(sitemapper.initializeTimeout).toBeInstanceOf(Function);
    });

    it('should have crawl method', () => {
      expect(sitemapper.crawl).toBeInstanceOf(Function);
    });

    it('should have parse method', () => {
      expect(sitemapper.parse).toBeInstanceOf(Function);
    });

    it('should have fetch method', () => {
      expect(sitemapper.fetch).toBeInstanceOf(Function);
    });

    it('should construct with a url', () => {
      sitemapper = new Sitemapper({
        url: 'google.com',
      });
      expect(sitemapper.url).toBe('google.com');
    });

    it('should construct with a timeout', () => {
      sitemapper = new Sitemapper({
        timeout: 1000,
      });
      expect(sitemapper.timeout).toBe(1000);
    });

    it('should set timeout', () => {
      sitemapper.timeout = 1000;
      expect(sitemapper.timeout).toBe(1000);
    });

    it('should set url', () => {
      sitemapper.url = 'updated-url.com';
      expect(sitemapper.url).toBe('updated-url.com');
    });

    it('should construct with specific fields', () => {
      sitemapper = new Sitemapper({
        fields: {
          loc: true,
          lastmod: true,
          priority: true,
          changefreq: true
        }
      });
      expect(sitemapper.fields).toEqual({
        loc: true,
        lastmod: true,
        priority: true,
        changefreq: true
      });
    });
  });

  describe('fetch Method resolves sites to array', function () {
    it('https://wp.seantburke.com/sitemap.xml sitemaps should be an array', async () => {
      const url = 'https://wp.seantburke.com/sitemap.xml';
      const data = await sitemapper.fetch(url);

      expect(data.sites).toBeInstanceOf(Array);
      expect(data.url).toBe(url);
      expect(data.sites.length).toBeGreaterThan(2);
      expect(isUrl(data.sites[0].loc)).toBe(true);
    });

    it('gibberish.gibberish should fail silently with an empty array', async () => {
      const url = 'http://gibberish.gibberish';
      const data = await sitemapper.fetch(url)

      expect(data.sites).toStrictEqual([]);
      expect(data.errors).toStrictEqual([
        {
          message: 'Error occurred: RequestError',
          retries: 0,
          type: 'RequestError',
          url: 'http://gibberish.gibberish',
        },
      ]);
    });

    it('https://www.google.com/work/sitemap.xml sitemaps should be an array', async () => {
      const url = 'https://www.google.com/work/sitemap.xml';
      const data = await sitemapper.fetch(url);

      expect(data.sites).toBeInstanceOf(Array);
      expect(data.sites.length).toBeGreaterThan(2);
      expect(isUrl(data.sites[0].loc)).toBe(true);
    });

    it('https://www.channable.com/sitemap.xml sitemaps should contain all standard fields when fields not defined', async () => {
      const url = 'https://www.channable.com/sitemap.xml';
      sitemapper = new Sitemapper({});
      const data = await sitemapper.fetch(url);

      expect(data.sites).toBeInstanceOf(Array);
      expect(data.url).toBe(url);
      expect(data.sites.length).toBeGreaterThan(2);
      expect(data.sites[0]).toStrictEqual({
        loc: expect.any(String),
        lastmod: expect.any(String),
        priority: expect.any(String),
        changefreq: expect.any(String),
      });
    });

    it('https://www.channable.com/sitemap.xml sitemaps should contain a subset of fields', async () => {
      const url = 'https://www.channable.com/sitemap.xml';
      sitemapper = new Sitemapper({
        fields: ["loc", "lastmod"]
      });
      const data = await sitemapper.fetch(url);

      expect(data.sites).toBeInstanceOf(Array);
      expect(data.url).toBe(url);
      expect(data.sites.length).toBeGreaterThan(2);
      expect(data.sites[0]).toStrictEqual({
        loc: expect.any(String),
        lastmod: expect.any(String),
      });
    });

    it('https://www.golinks.io/sitemap.xml sitemaps should be an array', async () => {
      const url = 'https://www.golinks.io/sitemap.xml';
      const data = await sitemapper.fetch(url);

      expect(data.sites).toBeInstanceOf(Array);
      expect(data.url).toBe(url);
      expect(data.sites.length).toBeGreaterThan(2);
      expect(isUrl(data.sites[0].loc)).toBe(true);
    });

    it('https://www.golinks.io/sitemap.xml sitemaps should return an empty array when timing out', async () => {
      const url = 'https://www.golinks.io/sitemap.xml';
      sitemapper.timeout = 1;
      const data = await sitemapper.fetch(url);

      expect(data.sites).toStrictEqual([]);
      expect(data.errors).toStrictEqual([
        {
          message: `Request timed out after 1 milliseconds for url: 'https://www.golinks.io/sitemap.xml'`,
          retries: 0,
          type: 'CancelError',
          url: 'https://www.golinks.io/sitemap.xml',
        }
      ]);
    });

    it('https://www.golinks.com/blog/sitemap.xml sitemaps should return a parsed sitemap when not timing out', async () => {
      const url = 'https://www.golinks.com/blog/sitemap.xml';
      const data = await sitemapper.fetch(url);

      expect(data.sites).toBeInstanceOf(Array);
      expect(data.errors).toStrictEqual([]);
      expect(data.sites[0]).toStrictEqual(expect.objectContaining({
        loc: expect.any(String),
      }));
    });

    it('https://www.banggood.com/sitemap/category.xml.gz gzip should be a non-empty array', async () => {
      const url = 'https://www.banggood.com/sitemap/category.xml.gz';
      const data = await sitemapper.fetch(url);

      expect(data.sites).toBeInstanceOf(Array);
      expect(data.sites.length).toBeGreaterThan(0);
    });

    it('handles multi-level nested "urlset"', async () => {
      vi.spyOn(got, 'get').mockResolvedValue({
        statusCode: 200,
        body: fs.readFileSync(path.join(dirname, 'fixtures/nested_urlset_sitemap.xml')),
      });

      const data = await sitemapper.fetch('https://www.example.com/sitemap.xml');

      expect(data).toStrictEqual({
        errors: [],
        sites: [
          {
            lastmod: '2025-01-09',
            loc: 'https://www.google.com.au/page-9',
          },
          {
            lastmod: '2025-01-01',
            loc: 'https://www.google.com.au/page-1',
          },
          {
            lastmod: '2025-01-02',
            loc: 'https://www.google.com.au/page-2',
          },
          {
            lastmod: '2025-01-03',
            loc: 'https://www.google.com.au/page-3',
          },
          {
            lastmod: '2025-01-04',
            loc: 'https://www.google.com.au/page-4',
          },
          {
            lastmod: '2025-01-05',
            loc: 'https://www.google.com.au/page-5',
          },
          {
            lastmod: '2025-01-06',
            loc: 'https://www.google.com.au/page-6',
          },
        ],
        url: 'https://www.example.com/sitemap.xml',
      })
    });
  });

  describe('gzipped sitemaps', function () {
    beforeEach(() => {
      sitemapper = new Sitemapper({
        requestHeaders: {
          'Accept-Encoding': 'gzip,deflate,sdch',
        }
      });
    });

    it('https://www.banggood.com/sitemap/category.xml.gz gzip should be a non-empty array', async () => {
      const url = 'https://www.banggood.com/sitemap/category.xml.gz';
      const data = await sitemapper.fetch(url);

      expect(data.sites).toBeInstanceOf(Array);
      expect(data.errors).toBeInstanceOf(Array);
      expect(data.sites.length).toBeGreaterThan(0);
    });

    it('https://foo.com/sitemap.xml should not allow insecure request', async () => {
      const url = 'https://foo.com/sitemap.xml';
      sitemapper.rejectUnauthorized = false;
      const data = await sitemapper.fetch(url);

      expect(data.sites).toStrictEqual([]);
      expect(data.errors).toStrictEqual([
        {
          type: 'HTTPError',
          message: 'HTTP Error occurred: Response code 404 (Not Found)',
          url: 'https://foo.com/sitemap.xml',
          retries: 0
        }
      ]);
    });
  });
});
