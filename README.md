# Welcome to @smcphub/server 👋
![Version](https://img.shields.io/badge/version-0.0.1-blue.svg?cacheSeconds=2592000)
[![Documentation](https://img.shields.io/badge/documentation-yes-brightgreen.svg)](https://www.smcphub.com/docs)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](#)

> MCP Server of SMCPHUB

SMCP Server is a simple and easy-to-use client for smcphub.com. It provides a simple API to interact with all the MCP Servers hosted in the smcphub.com.

SMCP hub is a platform that allows you to find the MCP servers which users published, or also publish your MCP Servers and get them listed and hosted on the website.

### 🏠 [Homepage](https://smcphub.com)

## Install

```sh
npm i @smcphub/server
```
OR

```sh
yarn add @smcphub/server
```

## Usage

Use official MCP Client to connect to the MCP Server.

```js

// import the SDK
import SmcphubClient from '@smcphub/client';

// Instantiate the client
const smcphubClient = new SmcphubClient({
    api_key: 'your-api-key'
});

// Connect the MCP Server
smcphubClient
.connect()
.then(tools => {
    console.log(tools);
})
.catch(err => {
  console.error(err);
});
    
// Call the tool
smcphubClient
.callTool('get_weather', {'city': '杭州'})
.then(content => {
    console.log(content);
})
.catch(err => {
  console.error(err);
});
```

Or customize the MCP Server.

## Author

👤 **SMCPHUB**