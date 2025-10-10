// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import { themes as prismThemes } from "prism-react-renderer";
// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "Ambrosia-POS",
  tagline: "The best experience POS with BTC",
  favicon: "img/favicon.ico",

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: "https://btcgdl.github.io",
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: "/Ambrosia-POS/",

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: "btcgdl", // Usually your GitHub org/user name.
  projectName: "Ambrosia-POS", // Usually your repo name.

  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: "es",
    locales: ["es", "en"],
    path: 'i18n',
    localeConfigs: {
      es: {
        label: 'Español',
        direction: 'ltr',
        htmlLang: 'es-ES',
        calendar: 'gregory',
        path: 'es',
      },
      en: {
        label: 'English',
        direction: 'ltr',
        htmlLang: 'en-US',
        calendar: 'gregory',
        path: 'en',
      },
    },
  },

  presets: [
    [
      "classic",
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: "./sidebars.js",
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl: "https://github.com/btcgdl/Ambrosia-POS/tree/main/docs/api",
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ["rss", "atom"],
            xslt: true,
          },
          blogSidebarTitle: "Entradas Recientes",
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            "https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/",
          // Useful options to enforce blogging best practices
          onInlineTags: "warn",
          onInlineAuthors: "warn",
          onUntruncatedBlogPosts: "warn",
        },
        theme: {
          customCss: "./src/css/custom.css",
        },
      }),
    ],
  ],

  plugins: [
    [
      "@docusaurus/plugin-content-blog",
      {
        id: "team",
        routeBasePath: "team",
        path: "./team",
        blogTitle: "Nuestro Equipo",
        blogDescription: "Conoce a nuestro increíble equipo",
        blogSidebarCount: 0,
        postsPerPage: "ALL",
        showReadingTime: false,
        feedOptions: {
          type: null,
        },
      },
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      image: "img/docusaurus-social-card.jpg",
      navbar: {
        title: "Ambrosia-POS",
        logo: {
          alt: "Ambrosia-POS-Logo",
          src: "img/logo.svg",
        },
        items: [
          {
            type: "docSidebar",
            sidebarId: "tutorialSidebar",
            position: "left",
            label: "REST-API",
          },
          { to: "/blog", label: "Blog", position: "left" },
          { to: "/team", label: "Equipo", position: "left" },
          { type: 'localeDropdown', position: 'right' },
          {
            href: "https://github.com/btcgdl/Ambrosia-POS",
            label: "GitHub",
            position: "right",
          },
        ],
      },
      footer: {
        style: "dark",
        logo: {
          alt: "Apóyanos",
          src: "img/sponsorqr.svg",
        },
        links: [
          {
            title: "Documentacion",
            items: [
              {
                label: "Api",
                to: "/docs/API/Authentication/Auth",
              },
            ],
          },
          {
            title: "Comunidad",
            items: [
              {
                label: "BTCGDL",
                href: "https://btcgdl.com/",
              },
              {
                label: "Instagram",
                href: "https://www.instagram.com/btc.gdl/",
              },
              {
                label: "X",
                href: "https://x.com/btc_ln_gdl",
              },
            ],
          },
          {
            title: "Mas sobre nosotros",
            items: [
              {
                label: "Blog",
                to: "/blog",
              },
              {
                label: "GitHub",
                href: "https://github.com/btcgdl",
              },
            ],
          },
        ],
        copyright: `Apóyanos`,
      },
      prism: {
        theme: prismThemes.oceanicNext,
        darkTheme: prismThemes.dracula,
      },
    }),
};

export default config;
