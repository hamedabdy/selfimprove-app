const path = require('path');

   module.exports = {
     entry: './react-component.js',
     output: {
       filename: 'bundle.js',
       path: path.resolve(__dirname, 'public'),
     },
     module: {
       rules: [
         {
           test: /\.js$/,
           exclude: /node_modules/,
           use: {
             loader: 'babel-loader',
             options: {
               presets: ['@babel/preset-env', '@babel/preset-react'],
             },
           },
         },
       ],
     },
   };