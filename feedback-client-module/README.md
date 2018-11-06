# Deployment 
- update API_BASE_URL in Constants.ts to the web-api server address
- alter webpack.config.js, comment out the following part:
```
//,
// // uglify your scriptz
// plugins: [
//     new webpack.optimize.UglifyJsPlugin({ minimize: true })
// ]
```
- copy the content of the dist folder to the web werver

# Miscellaneous
- to test in any web page: Run "node pack.js" and paste contents of pack.txt into console and hit "Enter"