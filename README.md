# trip-page

### This app is a trip page for Ember buses, written in vue3 with typescript.

- The home page proves a list of in-progress trips from the ember quotes api (https://ember-core.stoplight.io/docs/api-documentation/a79721f8123d9-get-quotes). This page is mainly to provide a convient way to access trips.
- The trip page can be accessed from the homepage, by selecting an item which routes to /trip/{tripId}

## Trip page features

- State fetched and updated periodically
  - Url and update frequency can be configured in [src\config.ts](src\config.ts)
- Interactive map with bus location and stops displayed
  - Stop marker color changes based on whether the stop is to be visited or not
  - Bus can be optionally "tracked"
  - Button to place marker and zoom to user location (if access to user location is enabled)
- List of stops with estimated and scehduled time displayed
  - "Estimated time" color will vary based on how late the bus might be
  - Click list items to zoom to them on the map
  - Bus "tracking" can be toggled (represented by the pin icon on the bus row)
  - Bus facilities (WiFi / WC) displayed

## Considerations / ToDo

- Test coverage is thin and at best can be seen as an example / base to be built upon
- Styling is basic, intended for mobile screens but there are known issues (dark mode doesnt work well)
  - Styles are not inherited well
- Icons are mostly placeholder quality
- No real consideration yet for internationalization
- Some errors are logged to console or go to alert() but could be displayed better
  - Errors fetching data (eg if the phone is offline) should definitely be displayed better
- The leaflet openstreetmap tiles are arguably too detailed and might affect performnce on a mobile with poor internet connection. Perhaps there are less detailed but more efficient tilesets.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vitejs.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
npm run test:unit
```

### Run End-to-End Tests with [Cypress](https://www.cypress.io/)

```sh
npm run test:e2e:dev
```

This runs the end-to-end tests against the Vite development server.
It is much faster than the production build.

But it's still recommended to test the production build with `test:e2e` before deploying (e.g. in CI environments):

```sh
npm run build
npm run test:e2e
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```
