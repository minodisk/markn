# Contributing

## Environment

```bash
npm install
```

## Debugging

```bash
gulp
```

## Update icons

### Ready in MacOSX

1. Install wine with `brew install wine`.

### Make iconset

Write icons into `assets/Markn.iconset`

## Publication (Only Owner or Collaborator)

Requires github OAuth `TOKEN`.

- Major release: `TOKEN=XXXXXXXXXXXX gulp publish -r major`
- Minor release: `TOKEN=XXXXXXXXXXXX gulp publish -r minor`
- Patch release: `TOKEN=XXXXXXXXXXXX gulp publish -r patch` or just `TOKEN=XXXXXXXXXXXX gulp publish`
