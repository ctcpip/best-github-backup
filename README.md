# Best GitHub Backup

[![test](https://github.com/ctcpip/best-github-backup/actions/workflows/test.yml/badge.svg)](https://github.com/ctcpip/best-github-backup/actions/workflows/test.yml)

this is the best GitHub backup program. it does not suck, and here is why:

- robust and resilient implementation
  - network failed in the middle of the operation? computer went to sleep? no problem. it will pick up where it left off when you run it again
    - no more worrying about having to start the entire process over again 🙊
- flat file database
  - all records are MessagePack files
  - if you're feeling adventurous you can `JSON.stringify()` the entire database 🙈
    - go on. do it.
- efficient use of the GitHub API
  - makes as few requests as possible
  - only fetches new data since the last successful run
    - it won't miss anything if there was a failure at any point. checkpoints get updated on a per-repo, per-type basis and only after all records were successfully saved
  - only fetches the important stuff
    - if it's not included, you don't need it. probably. 🙉

## Install

```sh
npm i -g best-github-backup
```

## Use

you'll need a [GitHub API token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens) with at least `repo` and `read:org` scopes 🔭

```sh
best-github-backup -o <org> -t <token>
```

## License

[GNU GPLv3](LICENSE) ☭
