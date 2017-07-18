# Columbus Arts Festival Map

## What is this?

It's a simple single-page, frontend-only Angular app that uses the Google Maps API to render a map of the Columbus Arts Festival showing the location of artist booths and various points of interest.

### Technical details

This is an Angular 1 app that uses the Angular Google Maps library to access the Google Maps API. Styling is provided by Angular Material. Grunt is used to compile the front-end code. There is a local NGINX server (running inside a Docker container) that can be used to run the app during local development; do not use this server in production (see "Deploying to production" below).

### Authors

[Igor Ferst](https://github.com/igorferst)

[Brandon Every](https://github.com/beveryday)

## Installation and setup

Before you can compile and run the app locally, you'll need to install some prerequisites and put some special secret values in your environment.

### Install prerequisites

You'll need to install the following prerequisites:

1. [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/install/)
2. [Node.js](https://nodejs.org/)

After installing Node, install Grunt and Bower via `npm`:

```
npm install -g bower
npm install -g grunt-cli
```

### Install dependencies

After installing Node and Bower, you can install the app's dependencies:

```
cd web/
bower install
npm install
```

### Secrets

Before running the app, you need to provide two secret values as the following two environment variables

`GOOGLE_MAPS_API_KEY`: your Google Maps API key

`GOOGLE_ANALYTICS_TRACKING_ID`: your Google Analytics key

Grunt reads these environment variables and inserts them into the right place in the code.

The map won't work without a Google Maps API key; if you don't have one, you can get one using these [instructions](https://developers.google.com/maps/documentation/javascript/get-api-key). Do not follow the instructions for adding the key to your app - just get the key, set it as the above environment variable, and let Grunt do the rest.

The map will work without a Google Analytics tracking ID, but no usage data will be collected (see below).


## Compiling and running locally

To run the app locally, you must first compile the code and then run the included NGINX server.

### Compiling the code

You compile the code by calling `grunt build` inside the `web` directory:

```
cd web/
grunt build
```

**IMPORTANT**: note that the compiled code will appear in `nginx/public`, *not* in `web/public`.

There is also a `grunt build:prod` command that compiles the code for production (by minifying it).

### The local server

The project includes a local NGINX server running inside a Docker container that can be used to serve up the app during local development.

After compiling the code, start the server by returning to the project root directory and running the following Docker Compose commands:

```
cd .. # go to project root directory
docker-compose build
docker-compose up
```
The app will be available at `https://localhost/`.


### `grunt watch`

If you're developing, you'll want to call `grunt watch` after the build. This will leave Grunt running and trigger a re-build on code change, which means that if you change the code, the changes will appear in your browser after a page refresh.

Adding or removing files requires restarting Grunt. So if you have `grunt watch` running when you add or remove a file, kill it, call `grunt build` again, and then `grunt watch` again. Grunt will also not pick up changes to data files (see below).







## Map data

The map data comes from two files in `web/assets/data/`. The data files included in the project represent data for the 2017 festival.

### Artist data

The file `artist_data.json` contains artist data. It is a JSON array whose elements look like this:

```
  {
    "boothNumber": "116R",
    "businessName": "Fine Art by Brooke Albrecht",
    "firstName": "Brooke",
    "lastName": "Albrecht",
    "city": "Harvest",
    "state": "AL",
    "location": {
      "longitude": -83.00195357760037,
      "latitude": 39.95717652794487
    },
    "website": "www.facebook.com/fineartbybrookealbrecht/",
    "thumbnail": "https://www.columbusartsfestival.org/application/public/media/artist/1873/thumb/Albrecht_003236_387880_11068104_5076.jpg",
    "category": "Painting"
  }
```

Note that `website` should not include the protocol, while `thumbnail` (which is a link to an image thumbnail) should.


### Points of interest data

The file `poi_data.json` contains point-of-interest data. It is a JSON array whose elements look like this:

```
  {
    "boothNumber": "merch2",
    "name": "Festival Merchandise",
    "type": "merchandise",
    "location": {
      "longitude": -83.00542919999998,
      "latitude": 39.9575706
    },
    "website": ""
  }
```

The `website` property is optional and can be used to link to a website with additional information.

The recognized PoI types are:

```
merchandise
beverages
beverages_non_alcoholic
beverages_frozen_drinks
first_aid
food
restrooms
restrooms_non_ada
stage
```

### Data caching

To improve performance, the app is configured to cache both data files in local storage after loading them for the first time. The app will also store the version of the cached files, which makes it possible to invalidate this cache by.

Specifically, if you update artist data, you *must* increment the variable `ARTIST_DATA_VERSION` in `web/services/artist-data.js`. Then the app will fetch the artist data again even if it has been cached. Similarly, if you update PoI data, you must increment the variable `POI_DATA_VERSION` in `web/services/poi-data.js`.

**IMPORTANT:** if you update the data in `web/assets/data/` without incrementing the version variable in the code, the app will continue to use the old, cached data.

If you're developing locally, you can manually clear your browser's local storage to invalidate the data cache. In production, however, the only way to invalidate the data cache is by incrementing the data version variable in the code and deploying the new code.

## Tracking usage

The app uses Google Analytics to track usage data. Specifically, it uses GA events to record when users perform specific actions in the app.

An event in GA has the following properties: event category, event action, and event label. In the app, these properties are used as follows:

* Event category: this is the event type. The list of event types is given below.
* Event action: this is a unique ID assigned to each device accessing the app. This field can be used to count unique visitors.
* Event label: type-dependent event data. The value of this property changes based on the event type.

### Event types

Here are the event types and what they represent:

* `click_current_location`: user manually hitting the button to center the map at their current location.
* `click_legend`: user opening or closing the legend.
* `clicked_marker`: user hitting a map marker. The event data in this case is the booth ID for the clicked marker.
* `geolocation_error`: denotes a problem getting the user's location. The event data in this case is the [error code](https://developer.mozilla.org/en-US/docs/Web/API/PositionError).
* `search_artist_by_category`: a selection of some categories from the category list. The event data is a comma delimited list of the categories selected.
* `search_artist_by_name`: a selection of an artist after searching for that artist by name.
* `position`: this represents a recording of the user's position. The event data is the position as lat/long coordinates. This event is recorded every time the app updates the user's position, which happens every 5 seconds.

## Deploying to production

Since this is a frontend-only app, it's really nothing more than a bunch of static web content, which makes it quite easy to deploy.

First, build the app for production with

```
cd web/
grunt build:prod
```

Then take the compiled web code in `nginx/public` and serve it up with your favorite web server or CDN. That's it.

The `build:prod` grunt task is just like `build` but with code minification.

**IMPORTANT** you *must* use an SSL certificate on the domain from which you serve the app. Geolocation services and the Google Maps API both require a secure origin. The NGINX server we use for local development uses an SSL certificate - do not use it in production!

## Frequently Asked Questions

* _What's the browser compatibility situation?_

	Not great. The app has been tested on modern Chrome and Safari and works fine, but performance on older browsers is unknown. Moreover, there are known issues with IE (even modern versions).

* _When I load the app, I see `Possibly unhandled rejection: gObject is null` in the console. What's up with that?_

	I don't know.

* _Are there unit tests?_

	No.
