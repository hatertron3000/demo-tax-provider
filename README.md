
  

# Demo tax provider

This is a demo tax provider built with the [BigCommerce node sample app](https://github.com/bigcommerce/sample-app-nodejs). It is intended to be used for demonstration purposes only. This application applies a 10% tax rate to all tax requests.

  

It currently only implements the [Estimate Taxes](https://developer.bigcommerce.com/api-reference/providers/tax-provider-api/tax-provider/estimate) endpoint. That endpoint is _/api/tax/estimate_. The Void, Commit, and Adjust endpoints may or may not be added in the future.

  

This application sets the same username and password, stored as environment variables, when [establishing connections](https://developer.bigcommerce.com/api-docs/providers/tax#establishing-a-connection) with BigCommerce stores. You may supply any value that you like for these environment variables as long as they do not contain colons. If you intend to use this application for more than one merchant, consider implementing a UI to allow the merchant to configure the username/password.

  

Recommended reading: [https://developer.bigcommerce.com/api-docs/providers/tax](https://developer.bigcommerce.com/api-docs/providers/tax)

  

## App Installation

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/hatertron3000/demo-tax-provider)

  

To get the app running locally, clone the repo with `git clone https://github.com/hatertron3000/demo-tax-provider` then follow these instructions:

  

1.  [Use Node 10+ and NPM 7+](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm#checking-your-version-of-npm-and-node-js)

  

2. Install npm packages

  

-  `npm install`

  

3.  [Add and start ngrok.](https://www.npmjs.com/package/ngrok#usage) Note: use port 3000 to match Next's server.

  

-  `npm install ngrok`

  

-  `ngrok http 3000`

  

4.  [Register a draft app.](https://developer.bigcommerce.com/api-docs/apps/quick-start#register-a-draft-app)

  

- For steps 5-7, enter callbacks as `'https://{ngrok_id}.ngrok.io/api/{auth||load||uninstall}'`.

  

- Get `ngrok_id` from the terminal that's running `ngrok http 3000`.

  

- e.g. auth callback: `https://12345.ngrok.io/api/auth`

  

5. Copy .env-sample to `.env`.

  

- TAX_PROVIDER_ID must be provided by BigCommerce.

  

- You may leave this value blank until BigCommerce has registered your tax provider app, but the application will recieve a 404 response from the [Update Connection](https://developer.bigcommerce.com/api-reference/store-management/tax/tax-provider-connection/provider-connection-put) request until a valid value is supplied.

  

- See the [BigCommerce documentation](https://developer.bigcommerce.com/api-docs/providers/tax#sharing-provider-details-with-bigcommerce) for more information.

  

- If deploying on Heroku, skip `.env` setup. Instead, enter `env` variables in the Heroku App Dashboard under `Settings -> Config Vars`.

  

6.  [Replace client_id and client_secret in .env](https://devtools.bigcommerce.com/my/apps) (from `View Client ID` in the dev portal).

  

7. Update AUTH_CALLBACK in `.env` with the `ngrok_id` from step 5.

  

8. Enter a jwt secret in `.env`.

  

- JWT key should be at least 32 random characters (256 bits) for HS256

  

9. Specify DB_TYPE in `.env`

  

- If using Firebase, enter your firebase config keys. See [Firebase quickstart](https://firebase.google.com/docs/firestore/quickstart)

  

- If using MySQL, enter your mysql database config keys (host, database, user/pass and optionally port). Note: if using Heroku with ClearDB, the DB should create the necessary `Config Var`, i.e. `CLEARDB_DATABASE_URL`.

  

10. Start your dev environment in a **separate** terminal from `ngrok`. If `ngrok` restarts, update callbacks in steps 4 and 7 with the new ngrok_id.

  

-  `npm run dev`

  

11.  [Install the app and launch.](https://developer.bigcommerce.com/api-docs/apps/quick-start#install-the-app)

  

## Testing

  

Once your app is running locally or on heroku, you may use [this Postman collection](https://documenter.getpostman.com/view/45334/UVXhqGyd) to test responses from the /api/tax/estimate endpoint.

### Delay Responses

To simulate a delay in response, pass a string in the format `DELAY:TIME_IN_MS` where `TIME_IN_MS` is a number in the `customer.taxability_code` in the estimate request. See [BigCommerce documentation](https://support.bigcommerce.com/s/article/How-do-I-have-customers-with-a-tax-exempt-status) for more information on adding the taxability_code to customer accounts.

  
## Usage with BigCommerce

  

Once BigCommerce has registered your application as a tax provider and you have configured the TAX_PROVIDER_ID environment variable, when you install the app onto a BigCommerce then you will be able to enable it from the _Settings > Tax_ page in the store's control panel.