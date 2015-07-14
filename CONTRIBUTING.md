# Contributing

## Environment

```bash
npm install
```

## Debugging

```bash
gulp
```

## Publication (Only Owner or Collaborator)

Requires github OAuth `TOKEN`.

- Major release: `TOKEN=XXXXXXXXXXXX gulp publish -r major`
- Minor release: `TOKEN=XXXXXXXXXXXX gulp publish -r minor`
- Patch release: `TOKEN=XXXXXXXXXXXX gulp publish -r patch` or just `gulp publish`
