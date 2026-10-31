<div align="center">

<a href="https://blog.gaoredu.com" title="ReactPress">
  <img height="88" src="./public/brand/logo.png" alt="ReactPress">
</a>

<img src="./public/poster.png" alt="ReactPress — The Modern Web Creation Platform." width="100%" />

# ReactPress

### The Modern Web Creation Platform.

**Build. Manage. Extend.**

A writing Admin, a Next.js site you own, and themes & plugins to grow — all from one install.

[Live demo](https://blog.gaoredu.com) · [Theme demo](https://reactpress-theme-starter.vercel.app) · [Docs](https://reactpress.cc/) · [中文](./README-zh_CN.md)

[![npm](https://img.shields.io/npm/v/@fecommunity/reactpress.svg?style=flat-square&label=npm)](https://www.npmjs.com/package/@fecommunity/reactpress)
[![stars](https://img.shields.io/github/stars/fecommunity/reactpress?style=flat-square)](https://github.com/fecommunity/reactpress/stargazers)
[![license](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](./LICENSE)

</div>

---

## Who it's for

- **Independent developers** who want a personal blog, notes, or docs site they own — not a SaaS tenant.
- **Small teams** where someone writes in an admin UI and someone else owns the public site.
- **WordPress leavers** who want the same “open admin, hit publish” habit, without a PHP theme stack.
- **Static-site users** (Hugo, Hexo, Astro, Next.js Markdown) who are tired of asking non-developers to open a Git repo.

If you are assembling Strapi or Payload _plus_ an admin _plus_ a frontend _plus_ deploy glue, this is the product-shaped alternative.

---

## What it solves

Publishing is still a mess for React people:

| You want…                         | What you usually get                                   |
| :-------------------------------- | :----------------------------------------------------- |
| Editors who are not engineers     | A Git-based static site                                |
| A site that looks like _your_ app | WordPress or Ghost, with someone else’s frontend       |
| To ship this week                 | A headless CMS that still needs a site, admin, and ops |
| To write on a plane               | A browser tab and a running server                     |

ReactPress is the middle path: **writers get an editor, you get a React site, nobody stitches the stack.**

---

## vs the usual options

|                          | ReactPress       | [WordPress](https://wordpress.org) | [Ghost](https://github.com/TryGhost/Ghost) | [Strapi](https://github.com/strapi/strapi) / [Payload](https://github.com/payloadcms/payload) | [Hugo](https://github.com/gohugoio/hugo) / [Astro](https://github.com/withastro/astro) |
| :----------------------- | :--------------- | :--------------------------------- | :----------------------------------------- | :-------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------- |
| Who publishes            | Writers in Admin | Writers in Admin                   | Writers in Admin                           | You still build the site                                                                      | Developers (Git)                                                                       |
| Who owns the public site | You (Next.js)    | PHP themes                         | Ghost themes                               | You, separately                                                                               | You, at build time                                                                     |
| Time to a working site   | One CLI command  | Install + theme + plugins          | Install + theme                            | CMS + frontend + glue                                                                         | Fast — until someone needs a CMS                                                       |
| Offline writing          | Desktop app      | No                                 | No                                         | No                                                                                            | Local files                                                                            |

- **WordPress** — unbeatable editing culture; you inherit PHP.
- **Ghost** — excellent independent publishing; membership-first, not a React app you own.
- **Strapi / Payload** — excellent engines; you still assemble the product.
- **Hugo / Hexo / Astro** — excellent pages; publishing still happens in Git.

---

## Try it

```bash
npm i -g @fecommunity/reactpress
mkdir my-site && cd my-site
reactpress init
```

Then open **http://localhost:3001** (site) and **http://localhost:3001/admin/** (`admin` / `admin`).

Node 20+. No Docker, no extra database for the default path. If something fails: `reactpress doctor`.

---

## See it

<div align="center">

![ReactPress — from empty folder to a running site](./public/usage.gif)

<table>
  <tr>
    <td width="50%" align="center" valign="top">
      <a href="./desktop/README.md">
        <img src="./public/desktop.gif" alt="Write offline in the desktop app" width="100%" />
      </a>
      <br/>
      <sub>Write offline. Sync when you are back.</sub>
    </td>
    <td width="50%" align="center" valign="top">
      <a href="https://reactpress-theme-starter.vercel.app">
        <img src="./public/demo.gif" alt="Visitor site with search, comments, and knowledge base" width="100%" />
      </a>
      <br/>
      <sub>The site visitors actually see.</sub>
    </td>
  </tr>
</table>

</div>

---

## Next

|                        |                                                                                                   |
| :--------------------- | :------------------------------------------------------------------------------------------------ |
| Docs                   | [reactpress.cc](https://reactpress.cc/)                                                           |
| Swap the public theme  | [themes](./themes/README.md) · [starter](https://github.com/fecommunity/reactpress-theme-starter) |
| Extend without forking | [plugins](./plugins/README.md)                                                                    |
| Desktop writing        | [desktop](./desktop/README.md)                                                                    |
| Host it                | [Deployment](https://reactpress.cc/)                                                              |

[Contributing](./CONTRIBUTING.md) · [Changelog](./CHANGELOG.md) · [MIT License](./LICENSE)

---

<div align="center">

If this saves you from wiring a CMS, an editor, and a frontend yourself — [**star the repo**](https://github.com/fecommunity/reactpress/stargazers).

<br/>

<!-- star-history:start -->
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="public/star-history/star-history-dark.svg">
  <img alt="Star History Chart" src="public/star-history/star-history-light.svg">
</picture>
<!-- star-history:end -->

</div>
