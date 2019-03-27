import { findLast } from '@angular/compiler/src/directive_resolver';

// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  firebase: {
    apiKey: "AIzaSyBXkVTS0I9MN_7tM9JE20MJA0Eeyiyqst0",
    authDomain: "dynamo-t.firebaseapp.com",
    databaseURL: "https://dynamo-t.firebaseio.com",
    projectId: "dynamo-t",
    storageBucket: "dynamo-t.appspot.com",
    messagingSenderId: "232441316256"
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
