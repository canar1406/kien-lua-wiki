// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import {themes as prismThemes} from 'prism-react-renderer';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Kiến Lửa Wiki',
  tagline: 'Kẻ thống trị nhỏ bé nhưng nguy hiểm',
  favicon: 'img/favicon.ico',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: 'https://canar1406.github.io',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/kien-lua-wiki/',
  trailingSlash: false,

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'canar1406', // Usually your GitHub org/user name.
  projectName: 'kien-lua-wiki', // Usually your repo name.

  onBrokenLinks: 'throw',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'vi',
    locales: ['vi'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
          // Useful options to enforce blogging best practices
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
        },
        theme: {
          customCss: [
            './src/css/custom.css',
            './src/css/phycat-abyss.css',
            './src/css/phycat-sky.css'
          ],
        },
      }),
    ],
  ],

  plugins: [
    async function myPlugin(context, options) {
      return {
        name: "docusaurus-tailwindcss",
        configurePostCss(postcssOptions) {
          postcssOptions.plugins.push(require("@tailwindcss/postcss"));
          postcssOptions.plugins.push(require("autoprefixer"));
          return postcssOptions;
        },
      };
    },
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      image: 'img/docusaurus-social-card.jpg',
      colorMode: {
        defaultMode: 'light',
        disableSwitch: false,
        respectPrefersColorScheme: false,
      },
      navbar: {
        title: 'Kiến Lửa Wiki',
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'tutorialSidebar',
            position: 'left',
            label: 'Bách Khoa Toàn Thư',
          },
        ],
      },
      footer: {
        style: 'light',
        links: [
          {
            title: 'Khám phá',
            items: [
              {
                label: 'Bách Khoa Toàn Thư',
                to: '/docs/nguon-goc-va-lich-su',
              },
            ],
          },
          {
            title: 'Thành viên dự án',
            items: [
              { label: 'Nguyễn Quốc Gia Huy (Leader, Thuyết trình)', to: '#' },
              { label: 'Trương Minh Khoa (Người đi bắt kiến)', to: '#' },
              { label: 'Đặng Quang Minh (Soạn nội dung)', to: '#' },
              { label: 'Đặng Trần Diễm Phúc (Soạn nội dung)', to: '#' },
              { label: 'Võ Nguyễn Hoàng Long (Người đi bắt kiến, Dev)', to: '#' },
            ],
          },
          {
            title: 'Thành viên dự án (Tiếp)',
            items: [
              { label: 'Thanh Ngọc (Xây nơi ở cho kiến)', to: '#' },
              { label: 'Phan Lê Ánh Ngọc (Cho kiến ăn)', to: '#' },
              { label: 'Nguyễn Trọng Nhân (Cho kiến ăn)', to: '#' },
              { label: 'Uyên Phạm (Cho kiến ăn)', to: '#' },
              { label: 'Lê Viết Triết (Thuyết trình)', to: '#' },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Dự án Sinh Học. Built with Docusaurus.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
    }),
};

export default config;
