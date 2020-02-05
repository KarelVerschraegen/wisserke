# Wisserke

> A GitHub App built with [Probot](https://github.com/probot/probot) that that automatically adds a "Het eiland" gif if your pull request has more deletions than additions.

## Configuration
If you want to customise this bot, create the `.github/wisserke.yml` config file

Available options:

| **Key**                  | **Description**                                              | **Default value**                                            |
| ------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| WISSERKE_GIF_URL         | The url to the gif, shown when the user has more additions than deletions. | "https://media.giphy.com/media/w8CGgakbif4iOZri06/giphy.gif" |
| WISSERKE_BODY            | The comment body.                                            | "\![](https://media.giphy.com/media/w8CGgakbif4iOZri06/giphy.gif)" |
| SHAME_GIF_URL            | The url to the gif, shown when the user has a large PR.      | "https://media.giphy.com/media/m6tmCnGCNvTby/giphy.gif"      |
| SHAME_BODY               | The comment body.                                            | "Small PR's, am I right?\n\n\![](https://media.giphy.com/media/m6tmCnGCNvTby/giphy.gif)" |
| PERCENTAGE_DIFF          | The percentage difference between the deletions and the additions. If the PR exceeds this threshold, the bot will post a `wisserke` comment. | 10                                                           |
| SMALL_PR_FILES_THRESHOLD | The amount of files in a small PR. If the PR exceeds this threshold, the bot will post a `shame` comment. | 150                                                          |

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
