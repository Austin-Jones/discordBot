// Run dotenv
require('dotenv').config();

const Discord = require('discord.js'); //add the main Discord.js class
const client = new Discord.Client(); //create a new instance
const Commands = require('./commands.js'); //our seperate command scripts
const ytdl = require('ytdl-core'); // inlcude the youtube downloader
const queue = new Map(); //declare a queue for music
const fetch = require('node-fetch'); //include fetch library for node
const CRYPTO_TOKEN = process.env.CRYPTO_TOKEN;
//ready, let's console it out
client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

//add welcome message
client.on('guildMemberAdd', member => {
    member.guild.channels.get('833740084791607367').send("Welcome! I'm FRIDAY. You can use #help for available commands.");
});
client.on('message', msg => {
    // convert to json to retrieve id
    let x = JSON.parse(JSON.stringify(msg));
    let channel_id = x.channelID//get channel id
    let channel = client.channels.cache.get(channel_id); //set channel

    //check if it's the bot talking
    if (msg.author.id === client.user.id) { return; }
    else {
        //check if it's a command
        if (msg.content.substring(0, 1) == '!') {
            var args = msg.content.substring(1).split(' '); //split command and argument by space
            var cmd = args[0]; //store command
            args = args.splice(1); //take the remainder (arguments) and store
            const serverQueue = queue.get(msg.guild.id);
            console.log(args);
            switch (cmd) {
                case 'help':
                    Commands.help(msg);
                    break;
                case 'meme':
                    Commands.meme(channel);
                    break;
                case 'play':
                    execute(msg, args, serverQueue);
                    break;
                case 'skip':
                    skip(msg, serverQueue);
                    break;
                case 'stop':
                    stop(msg, serverQueue);
                    break;
                case 'crypto':
                    Commands.crypto(channel, args, CRYPTO_TOKEN);
                    break;
                case 'fish':
                    Commands.fish(channel);
                    break;
                default:
                    msg.reply("That's not a command I recognize. Try #help for a list of available commands.")
            }
        } else {
            //not a command. maybe parse this over to an AI?
        }
    }

});

//music player probably will move this out of bot.js but documentation showed it like this. 
async function execute(msg, args, serverQueue) {
    const YOUTUBE_TOKEN = process.env.YOUTUBE_TOKEN;
    const voiceChannel = msg.member.voice.channel;
    if (!voiceChannel)
        return msg.channel.send(
            "You need to be in a voice channel to play music"
        );
    const permissions = voiceChannel.permissionsFor(msg.client.user);
    if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
        return msg.channel.send(
            "I need the permissions to join and speak in your voice channel!"
        );
    }
    let query = args.join(' '); // join the rest of the arguments

    const videoID = fetch('https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=' + query + '&maxResults=1&key=' + YOUTUBE_TOKEN)
        .then((response) => response.json())
        .then((json) => {
            return json.items[0].id.videoId;
        });

    const getQuery = async () => {
        if (query.includes('http')) {
            return ytdl.getInfo(query);
        } else {
            const a = await videoID;
            const b = await ytdl.getInfo(a);
            return b;
        }
    };

    console.log(getQuery)
    const songInfo = await getQuery();
    const song = {
        title: songInfo.videoDetails.title,
        url: songInfo.videoDetails.video_url,
    };

    if (!serverQueue) {
        const queueContruct = {
            textChannel: msg.channel,
            voiceChannel: voiceChannel,
            connection: null,
            songs: [],
            volume: 5,
            playing: true
        };

        queue.set(msg.guild.id, queueContruct);

        queueContruct.songs.push(song);

        try {
            var connection = await voiceChannel.join();
            queueContruct.connection = connection;
            play(msg.guild, queueContruct.songs[0]);
        } catch (err) {
            console.log(err);
            queue.delete(msg.guild.id);
            return msg.channel.send(err);
        }
    } else {
        serverQueue.songs.push(song);
        return msg.channel.send(`👍 **${song.title}** has been added to the queue.`);
    }
}

function skip(msg, serverQueue) {
    if (!msg.member.voice.channel)
        return msg.channel.send(
            "You have to be in a voice channel to stop the music!"
        );
    if (!serverQueue)
        return msg.channel.send("There are no more songs to skip.");
    serverQueue.connection.dispatcher.end();
}

function stop(msg, serverQueue) {
    if (!msg.member.voice.channel)
        return msg.channel.send(
            "You have to be in a voice channel to stop the music"
        );

    if (!serverQueue)
        return msg.channel.send("There are no more songs to stop");

    serverQueue.songs = [];
    serverQueue.connection.dispatcher.end();
}

function play(guild, song) {
    const serverQueue = queue.get(guild.id);
    if (!song) {
        serverQueue.voiceChannel.leave();
        queue.delete(guild.id);
        return;
    }

    const dispatcher = serverQueue.connection
        .play(ytdl(song.url))
        .on("finish", () => {
            serverQueue.songs.shift();
            play(guild, serverQueue.songs[0]);
        })
        .on("error", error => console.error(error));
    dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
    serverQueue.textChannel.send(`👍 Now Playing: **${song.title}**`);
}


//login with our key
client.login(process.env.DISCORD_TOKEN);
