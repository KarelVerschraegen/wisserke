# Wisserke

> A GitHub App built with [Probot](https://github.com/probot/probot) that that automatically adds a "Het eiland" gif if your pull request has more deletions than additions.

## Setup

``` sh
# Install dependencies
npm install

# Run typescript
npm run build

# Run the bot
npm start
```

## Deploy to heroku 

1. Install heroku-cli (OS-specific)

``` sh
	yay -S heroku-cli
```

2. Clone the repository
``` sh
	git clone https://github.com/KarelVerschraegen/wisserke.git
```

3. Create a Heroku app
``` sh
	heroku create
```

4. Update the Webhook URL in the [app settings page](https://github.com/settings/apps/wisserke) with the URL of the newly created heroku app

5. Configure the Heroku app with the environment variables
``` sh
	heroku config:set APP_ID=YOUR_ID WEBHOOK_SECRET=YOUR_SECRET PRIVATE_KEY=YOUR_PRIVATE_KEY
```

6. Push the code to heroku
``` sh
	git push heroku master
```

## Contributing

If you have suggestions for how Wisserke could be improved, or want to report a bug, open an issue! We'd love all and any contributions.

For more, check out the [Contributing Guide](CONTRIBUTING.md).

## License

[ISC](LICENSE) © 2020 Karel Verschraegen <karel@cheqroom.com>
