# hat-practice
Project's goal was to develop simple chat application using [hat-open](https://hat-open.com/) framework for better understanding of said technology. 

## Technologies
Project's main focus was to understand hat-gui and hat-event as servers for websocket communication between different users. Alongside server side project contains simple frontend built in JavaScript (Node.js). 

All Python dependancies are named in requirements.txt for easier usage.

## Setup
To run this project install it locally using npm and Python and follow instructions below.

```
$ pip install -r requirements.txt
$ npm install
```

Webpack is used to bundle frontend together. After first run change webpack.config.js' 6th and 10th line to input and output files from src_js/login and build/login instead of src_js/chat and build/chat.
```
$ ./node_modules/.bin/webpack --config webpack.config.js
```

Starting event and GUI servers as binaries like shown (order of commands matters).

```
$ hat-event --conf event.yaml
$ hat-gui --conf gui.yaml
```

## Further work 
Implement simple install script since I'm too lazy to do it now. 😉