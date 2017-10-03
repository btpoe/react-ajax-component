# Ajax Component

Ajax Component is an extendable React Component that gives you `enter` and `exit` classes
automatically as the component mounts, unmounts, and makes new API requests.

## Config

Edit the config object like so:
```javascript
import { config } from 'react-ajax-component';

config.apiMethod = 'GET';
```

- **apiMethod** _String_ (default: `'POST'`)
  <br>The type of method to fetch the API request.
  
- **apiHeaders** _Object_ (default: `{ 'Content-Type': 'application/json' }`),
  <br>Headers to include in API requests.

## Props

- **timeout** _Number_ (default: `1000`)
  <br>Duration to hold the `enter` and `exit` classes.

- **classNamePrefix** _String_ (default: `'is'`)
  <br>A string to append to the beginning of the `enter` and `exit` classes.

## Lifecycle Methods

When building out an extended class, here are the methods that you will likely need to edit,
depending on your needs.

- **shouldFetchData(** nextProps: _Object_ **): _Boolean_**
  <br>Used to determine if a new API request should be made. If `shouldFetchData` returns true,
  the old state of the Component will be mock unmounted and new data will emulate the
  appearance of a new Component.

- **resolveData(** nextProps: _Object_ **): _Promise_**
  <br>The logic that handles making the API request.

- **apiEndpoint(** nextProps: _Object_ **): _String_**
  <br>The url to send API request to.
  
- **apiPayload(** nextProps: _Object_ **): _Object_**
  <br>The data to include in the API request.

- **onDataUpdate()**
  <br>A function to be called after each API request has completed.

- **renderError(): _ReactElement | null_**
  <br>A React render function that will be used in the event of an API error.
  <br>_Note:_ `this.state.data` will be `null` and `this.state.errors` will be `true`.

- **renderLoader(): _ReactElement | null_**
  <br>A React render function that will be used before the API has responded.
  <br>_Note:_ `this.state.data` will be `null` at this point.
