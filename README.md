# DiscordBot

DiscordBot is a dead simple Discord bot, built on Node.js 

## Installation
You'll need Node.js and FFmpeg installed on the hosting machine.
Once downloaded, navigate to the project folder and run 
```
npm install
```
to install dependencies.
After dependency install, you will need to initialize the bot with 
```
node bot.js
```
The port can be changed in bot.js

## Usage

```
#meme - Gives the channel a random meme from Reddit.
#play song name OR link to youtube video - Will add a song to the music queue.
#skip - Will skip the current song in the queue.
#stop - Will stop playing music and clear the queue.
```

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License
[MIT](https://choosealicense.com/licenses/mit/)