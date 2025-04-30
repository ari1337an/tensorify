/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || "https://tensorify.io",
  generateRobotsTxt: true,
  // exclude: ["/server-sitemap.xml"], // <= exclude here
  // robotsTxtOptions: {
  //   additionalSitemaps: [
  //     "https://tensorify.io/server-sitemap.xml", // <==== Add here
  //   ],
  // },
};
