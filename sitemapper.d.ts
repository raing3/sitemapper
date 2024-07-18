export interface SitemapEntry {
  loc: string;
  lastmod?: string;
  changefreq?: string;
  priority?: string;
}

export interface SitemapperResponse<TFields extends keyof SitemapEntry> {
  url: string;
  sites: Array<Pick<SitemapEntry, TFields>>;
  errors: SitemapperErrorData[];
}

export interface SitemapperErrorData {
  type: string;
  url: string;
  retries: number;
}

export interface SitemapperOptions<TFields extends keyof SitemapEntry> {
  concurrency?: number;
  debug?: boolean;
  lastmod?: number;
  rejectUnauthorized?: boolean;
  requestHeaders?: {[name: string]: string};
  retries?: number;
  timeout?: number;
  url?: string;
  fields?: Array<TFields>;
}

declare class Sitemapper<TFields extends keyof SitemapEntry> {

  timeout: number;

  constructor(options: SitemapperOptions<TFields>)

  /**
   * Gets the sites from a sitemap.xml with a given URL
   *
   * @param url URL to the sitemap.xml file
   */
  fetch(url?: string): Promise<SitemapperResponse<TFields>>;
}

export default Sitemapper;
