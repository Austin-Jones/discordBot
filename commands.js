//include fetch for 3rd party API calls
const fetch = require('node-fetch');
//help command to list avaible commands, expects the message from discord
const help = function (msg) {
    msg.reply(`I'm FRIDAY. A Discord bot with some cool features. Below are the available commands:\n#meme - Gives the channel a random meme from Reddit.
#play song name OR link to youtube video - Will add a song to the music queue.
#skip - Will skip the current song in the queue.
#stop - Will stop playing music and clear the queue.

That's about all I can do.\n`);

}
// get a random meme expects the specific channel from discord
const meme = function (channel) {
    // url for memes
    let url = 'https://meme-api.herokuapp.com/gimme/2';
    fetch(url)
        .then(res => res.json())
        .then(json => {
            channel.send("", { files: [json.memes[0].url] });
        })
}
const crypto = function (channel, args, CRYPTO_TOKEN) {
    // url for memes
    args = args.join(' '); // join the rest of the arguments
    let url = 'https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?CMC_PRO_API_KEY=' + CRYPTO_TOKEN + '&slug=' + args;
    fetch(url)
        .then(res => res.json())
        .then(json => {
            //console.log([json.memes[0].url])
            let usd; let hourChange; let dayChange; let weekChange; let monthChange; let threeMoChange;
            for (var key in json.data) {
                usd = json.data[key].quote.USD.price;
                hourChange = json.data[key].quote.USD.percent_change_1h.toFixed(2);
                dayChange = json.data[key].quote.USD.percent_change_24h.toFixed(2);
                weekChange = json.data[key].quote.USD.percent_change_7d.toFixed(2);
                monthChange = json.data[key].quote.USD.percent_change_30d.toFixed(2);
                threeMoChange = json.data[key].quote.USD.percent_change_90d.toFixed(2);
            }
            channel.send(`Latest for **${args}**\n**Current Price**: $${usd}\n**Hourly Change**: ${hourChange}%\n**24 Hour Change**: ${dayChange}%\n**7 Day Change**: ${weekChange}%\n**30 Day Change**: ${monthChange}%\n**90 Day Change**: ${threeMoChange}%`);
        })
}

//export the functions that should be public
module.exports = {
    help, meme, crypto
}

