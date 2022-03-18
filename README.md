# Weather App

Simple Express.js app that uses location and ZIP information to pull Weather data.

## Description

Location and Weather Data are pulled via different APIs. Geo IP data is pulled via IPGEOLOCATION (https://ipgeolocation.io/). Weather data is pulled via (https://openweathermap.org/)

Project is created with Node.js, Express, TypeScript, HandleBars Templates, SaSS (processed via NPM Build).

Responsiveness handled via CSS Grid.

If being run locally the IP should be captured as localhost, and will default to 4.2.2.2

## Getting Started

### Installing

* Clone Repo
* Use mv sample-env to .env, add keys
* npm run dev
* Browse http://localhost:4000