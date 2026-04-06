# Weather Now

A responsive web app that fetches live weather data from the OpenWeatherMap API using either:

- a city entered by the user
- the user's current geolocation

It displays:

- temperature
- humidity
- weather condition
- feels like temperature
- wind speed
- pressure
- optional 5-day forecast

## Run

1. Open `index.html` in a browser.
2. Enter your OpenWeatherMap API key.
3. Search for a city or click `Use my location`.

## Notes

- The app stores the API key in `localStorage` for convenience in the current browser.
- Weather units are displayed in Celsius.
- Geolocation requires browser permission.
