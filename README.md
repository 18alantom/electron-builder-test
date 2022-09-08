# Electron Builder Test

> What is this?

Annotated repo containing code of how an electron application can be built and
packaged.

> Why is this?

It's basically an example of how to build and package an electron app without
the use of any plugins such as [vue-cli-plugin-electron-builder](https://github.com/nklayman/vue-cli-plugin-electron-builder).

> What does the electron app do?

Nothing much it's just a single button that increments a counter, the counter
value is written to an sqlite3 (in memory) db.

---

## Repo Layout

Main repo files and folders

```bash
.
├── build.mjs               # build script
├── serve.mjs               # serve script
├── main                    # electron code
├── src                     # frontend Vue + TS code
├── index.html              # frontend HTML entrypoint
├── electron-builder.yml    # electron builder config
└── vite.config.ts          # vite dev server configurations

```

The other files in the repo root are the usual js repo files and tsconfig files ([ref](https://www.typescriptlang.org/tsconfig)).

## Running the Scripts

To run the app in **development** call:

```bash
yarn serve
```

this will run the `serve.mjs` script that starts the frontend dev server and the electron process.

To **build** the application and **create installers** call:

```bash
yarn build
```

this will generate the installers into `./dist`

**Note:** to build for other targets, i.e. windows or linux you will need to
alter the `electron-builder.yml` file ([ref](https://www.electron.build/configuration/configuration)).

## Depedencies

- `better-sqlite3` this is a native dependency that needs to be built against electron's node ([ref](https://www.electronjs.org/docs/latest/tutorial/using-native-node-modules)). It's included to test this (inclusion of native dep). The `"postinstall"` script in the `package.json` takes care of this.
- `execa` convenience lib that builds over `node:child_process`, used in the serve script.
- `fs-extra` convenience lib that builds over `fs`, used in the build script.

Other dependencies are self explanatory. The front end dependencies are added by `yarn create vite` ([ref]( the serve script)), a script used to scaffold a `vite` handled app.

## Building Steps

Building an electron app into a distributable package has a few steps:

1. **Building the frontend code**: here any frontend technology can be used, this repo makes use of Vue and TypeScript, both of which need to be built before it can be run by a browser (which in the case of electron is chromium). The build process (transpiling, bundling, minification, etc) is handled using Vite.
2. **Building the electron code**: since the electron code is already written in using Vanilla Js, no building is required here, else again you can use your build tool of choice.
3. **Running Electron Builder**: once built, electron-builder is used, this packages all the built code into executables or installers.
