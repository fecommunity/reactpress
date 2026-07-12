# Security Policy

## Supported Versions

We release security fixes for the actively maintained ReactPress **4.x** line.
ReactPress 3.x receives critical fixes on a best-effort basis during the 4.x rollout.
Older major versions (2.x and below) no longer receive security updates unless
noted in a release announcement.

| Version | Supported          |
| :------ | :----------------- |
| 4.x     | :white_check_mark: |
| 3.x     | :warning: (transition) |
| 2.x     | :x:                |
| < 2.0   | :x:                |

Install the latest release:

```bash
npm i -g @fecommunity/reactpress@beta
```

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub Issues.**

If you discover a security issue, report it privately so we can investigate and
ship a fix before details are public:

1. **Preferred:** [Open a private security advisory](https://github.com/fecommunity/reactpress/security/advisories/new)
   on GitHub (Repository → **Security** → **Report a vulnerability**).
2. **Alternative:** Email the maintainers via a GitHub issue titled
   `Security report (private details)` and ask to move the conversation to a
   private channel — do **not** include exploit steps or sensitive data in the
   initial public comment.

Include as much of the following as you can:

- Affected component (CLI, API/server, client, toolkit, theme)
- ReactPress / npm package version
- Steps to reproduce (proof of concept if available)
- Impact assessment (data exposure, privilege escalation, RCE, etc.)
- Suggested remediation, if you have one

## What to Expect

| Timeline | Action |
| :------- | :----- |
| **Within 72 hours** | Acknowledgement of your report |
| **Within 7 days** | Initial assessment and severity classification |
| **Ongoing** | Status updates until resolved |
| **After fix** | Coordinated disclosure and credit in release notes (if desired) |

We appreciate responsible disclosure. Valid reports may be credited in
[CHANGELOG.md](./CHANGELOG.md) unless you prefer to remain anonymous.

## Security Best Practices for Deployments

When self-hosting ReactPress:

- Keep Node.js, dependencies, and `@fecommunity/reactpress` up to date
- Use strong database credentials; do not commit `.env` files
- Terminate TLS at your reverse proxy (see `reactpress nginx` in the CLI)
- Restrict admin/API access in production networks where possible
- Rotate API keys and webhook secrets periodically

For general bugs and feature requests (non-security), use
[GitHub Issues](https://github.com/fecommunity/reactpress/issues).
