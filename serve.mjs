import { execa } from 'execa';
/**
 * Serve Script
 *
 * To develop an electron app, when using a dev server
 * for the frontend, two processes need to be run
 *
 * 1. The dev server: here the vite dev server is run
 *    it serves the files on 0.0.0.0:3000
 * 2. The elctron processe: the electron process will load
 *    the dev server url
 */
process.env.MODE = 'development';

// Frontend dev server process
const viteProcess = execa('npx', ['vite']);
viteProcess.stdout.pipe(process.stdout);
viteProcess.stderr.pipe(process.stderr);

// Electron process
const electronProcess = execa('npx', ['electron', '.']);
electronProcess.stdout.pipe(process.stdout);
electronProcess.stderr.pipe(process.stderr);
