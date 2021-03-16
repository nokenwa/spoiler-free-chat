# Spoiler Free Chat
I built a private chat for my friend and I, that will hide spoilers whenever one of us hasn’t watched a new tv show episode. Here’s how I did it with Twilio Sync and Twilio Functions.

## Setup

Requirements:
1. [Node](https://nodejs.org/en/download/) version 10.19.0 or later (check version in your terminal with `node -v`).
1. A [Twilio account](https://twilio.com/referral/SaSofa).
1. A Twilio Phone Number [Buy one here](https://www.twilio.com/console/phone-numbers/search)
1. A Sync Service. [Create a new Sync Service in the console](https://www.twilio.com/console/sync/services)
1. The Twilio CLI. [Install the CLI for your operating system](https://www.twilio.com/docs/twilio-cli/quickstart#install-twilio-cli) and login with your account credentials using twilio login.
1. The Twilio serverless plugin. Install from the command line with `twilio plugins:install @twilio-labs/plugin-serverless`. More details in the [docs](https://www.twilio.com/docs/labs/serverless-toolkit/getting-started).

### Gather Credentials
Copy the .env.example and fill in the `ACCOUNT_SID`, `AUTH_TOKEN`, `TWILIO_NUMBER` and `SYNC_SERVICE_SID`
```
cp .env.sample .env
```
### Deploy Serverless Functions
Deploy the functions with the Twilio CLI

```
twilio serverless:deploy
```

Copy the url for the `forward-text` function.

### Update Phone number SMS URL

```
twilio phone-numbers:update <<INSERT TWILIO NUMBER>> --sms-url <<INSERT FORWARD-TEXT FUNCTION URL>>
```

### Setup Chat participants
Navigate to the asset marked `index.html` to find a webpage where you can add participants. 
![Screenshot of Webpage where you can add participants](https://github.com/nokenwa/spoiler-free-chat/blob/main/setupScreenshot.png)

Once set up all participants should receive a text informing them that they have been added to the group chat.

## Code of Conduct

This project adheres to the [Twilio Labs Code of Conduct](https://github.com/twilio-labs/.github/blob/master/CODE_OF_CONDUCT.md).

## Contributing

This project welcomes contributions. Please check out our [contributing guide](CONTRIBUTING.md) to learn more on how to get started.

## License

MIT © Twilio Inc.



