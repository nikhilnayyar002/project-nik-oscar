
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
<br>
<br>
<b>Note:</b>
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

These files have been removed as follows:
* install python from say https://www.python.org/downloads/windows/
* in the installer tick on checkbox to set path (or set path manually to installtion directory) and install python
* use command <code>pip3 install git-filter-repo</code>
* then for the file to remove in repo use:
   ```
   git filter-repo --path  src/environments/environment.ts--invert-paths
   git filter-repo --path  src/environments/environment.prod.ts--invert-paths
   ```