# mochibeagetaro-web
webシステムのプログラムソースリスト  

### Preparation before run
以下のファイルを作成しておいてください.

`MotibeAgetaro-web/apiserverpath.js`  
```javascript
exports.module={
  path: /* The url of the google cloud functions that deployed the MochibeAgetaro-web-to-server program */,
}
```  
`MotibeAgetaro-web/firebaseconfig.js`  
```javascript
exports.module={
  apiKey: /* apiKey of your firebase project */,
  authDomain: /* authDomain of your firebase project */,
  projectId: /* projectId of your firebase project */,
  storageBucket: /* storageBucket of your firebase project */,
  messagingSenderId: /* messagingSenderId of your firebase project */,
  appId: /* appId of your firebase project */
}
```  

### Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
