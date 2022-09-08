import builder from 'electron-builder';
import fs from 'fs-extra';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { build } from 'vite';

/**
 * Build Script
 *
 * To package an electron app, all the front end and electron files need to be
 * added to a folder and the elctron-builder needs to be called on that folder.
 *
 * 1. Build the frontend and move it to the bundled folder
 * 2. Move electron files to the bundled folder (index.js and preload.js)
 * 3. Run electron-builder.build
 */

const __dirname = fileURLToPath(new URL('.', import.meta.url));

(async () => {
  // Folder where the electron-builder.build artefacts will be stored
  const destDir = join(__dirname, 'dist');

  // Folder where final fronten and electron files are stored
  const bundledDir = join(destDir, 'bundled');
  fs.removeSync(destDir);

  // Use Vite to build the frontend and store it in bundleDir
  console.log('building frontend');
  await buildFrontend(bundledDir);

  // Copy electron code and other additional files required by the builder
  console.log('\ncopying files');
  await copyFiles(bundledDir);

  // Use electron-builder to generate the distribution packages
  console.log('\npackaging app');
  await packageApp(destDir, bundledDir);
})();

async function packageApp(destDir, bundledDir) {
  /**
   * Programmatically calls electron-builder.build that packages app from passed
   * directories.app and stores the output in directories.output.
   *
   * ref: https://www.electron.build/api/electron-builder#module_electron-builder.build
   */
  await builder.build({
    config: {
      directories: {
        output: destDir,
        app: bundledDir,
      },
      files: ['**'],
    },
  });
}

async function copyFiles(bundledDir) {
  /**
   * Copy electron code into bundledDir
   */
  fs.copy(join(__dirname, 'main'), join(bundledDir));

  /**
   * Creates and empty node_modules folder inside bundledDir to prevent
   * electron-builder.build from reinstalling them, this is not required
   * because the dependencies are already built and native dependencies are
   * built against target anyways.
   */
  fs.ensureDirSync(join(bundledDir, 'node_modules'));

  /**
   * Copies a modified version of package.json into bundledDir this is required
   * by electron to run the app.
   *
   * Modification: Changes main entry point to the app to index.js
   */
  modifyAndCopyPackageJSON(bundledDir);
}

async function buildFrontend(bundledDir) {
  /**
   * Programmatically builds the frontend using
   * vite.build
   *
   * ref: https://vitejs.dev/guide/api-javascript.html#build
   */
  const base = 'app://./';
  await build({
    base,
    build: { outDir: bundledDir },
  });

  /**
   * Vite sets base as '/app://./' as 'app:' is not considered as a valid
   * protocol, this function will remove the leading slash and set base as
   * 'app://./'
   */
  removeBaseLeadingSlash(bundledDir, base);
}

async function modifyAndCopyPackageJSON(bundledDir) {
  const fileBuffer = await fs.readFile(join(__dirname, 'package.json'));
  const packageJSON = JSON.parse(fileBuffer.toString('utf-8'));
  packageJSON.main = 'index.js';

  await fs.writeFile(
    join(bundledDir, 'package.json'),
    JSON.stringify(packageJSON, null, 2)
  );
}

function removeBaseLeadingSlash(dir, base) {
  for (const file of fs.readdirSync(dir)) {
    const path = join(dir, file);
    if (fs.lstatSync(path).isDirectory()) {
      removeBaseLeadingSlash(path, base);
      continue;
    }

    const contents = fs.readFileSync(path).toString('utf-8');
    fs.writeFileSync(path, contents.replaceAll('/' + base, base));
  }
}
