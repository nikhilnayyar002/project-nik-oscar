
# NikOscarLucky
<a href='https://nikoscar.firebaseapp.com'>Current Release</a><br>
<a href='https://dynamo-t.firebaseapp.com'>First release</a>


This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 7.3.6.

<h1>Hi there.</h1>

<h2>1. Steps to install:</h2>
<ul>
    <li>Clone the project</li>
    <li>npm install</li>
    <li>ng serve -o</li>        
</ul>

<h2>2. Project Details:</h2>
<p>Angular - Firebase</p>

<h6>Note:</h6>
<p>The environments folder in src folder is not pushed to origin. It contain two files:</p>
```
+ src
  + environments
    - environment.ts
    - environment.prod.ts
```
Both files contain key as:
```
export const environment = {
  production: false,
   firebase: {
    apiKey: "",
    authDomain: "",
    databaseURL: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: ""
  }
};

```