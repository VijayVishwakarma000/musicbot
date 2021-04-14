const Discord = require('discord.js')
const{execasync} = require('async_hooks')
const bot = new Discord.Client()
const ytdl = require('ytdl-core')
const {YTSearcher}= require('ytsearcher')
const config = require('./config.json')
const searcher = new YTSearcher({
    key:"AIzaSyCuvXGRw6032R-8t9PJIxpmfFcLY1IFGgU",
    revealed:true
})
const prefix = config.prefix
const token = config.token

const queue = new Map()
bot.on('ready', async (msg) => {
    console.log('iam ready')

    bot.user.setActivity(" TOXIC",{
        type:"LISTENING"

        
    })
})


bot.on('message', async msg=>{
    const prefix = "$"

    const serverqueue = queue.get(msg.guild.id)



    const args = msg.content.slice(prefix.length).trim().split(/ +/g)
    const cmd = args.shift().toLowerCase()

    if(cmd === 'sing'){
        exec(msg,serverqueue)
    }

    switch(cmd){
        case 'play':
            exec(msg,serverqueue)
            break
            case 'stop':
                stop(msg,serverqueue)
                break    
            case 'skip':
                skip(msg,serverqueue)
                break    
            }
    async  function exec (msg,server){
        var vc = msg.member.voice.channel
        if(!vc){
            return msg.reply('Please join a Voice channel')
        }
        else{
            let result = await searcher.search(args.join(" "),{type:"video"})
            msg.channel.send(result.first.url)
            const songInfo = await ytdl.getInfo(result.first.url)
            let song = {
                title:songInfo.videoDetails.title,
                url:songInfo.videoDetails.video_url
            }    
            if(!serverqueue){
                const queueconst = {
                    txtchannel : msg.channel,
                    vChannel:vc,
                    connect:null,
                    songs:[],
                    volume:10,
                    playing:true    
                    

                }
                queue.set(msg.guild.id,queueconst)
                queueconst.songs.push(song)
                try{
                    let connection = await vc.join()
                    queueconst.connection  = connection
                    play(msg.guild,queueconst.songs[0])
                }    
                catch(err){
                    console.log(err);
                    queue.delete(msg.guild.id)
                    return msg.channel.send("Unable to join voice chat "+err)
                }
            }
            else{
                serverqueue.songs.push(song)
                return msg.channel.send(`the song has been added ${song.url}`)
            }
        }    
    }function play(guild,song){
        const serverqueue = queue.get(guild.id)
        if(!song){
            serverqueue.vChannel.leave()
            queue.delete(guild.id)
            return
        }
        const dispatch = serverqueue.connection
        .play(ytdl(song.url))
        .on('finish',()=>{
            serverqueue.song.shift()
            play(guild,serverqueue.songs[0])
        })
    }
    function stop(msg,serverqueue){
        if(!msg.member.voice.channel){
            msg.member.channel.send("Join voice chat first!")
            serverqueue.songs =[]
            serverqueue.connection.dispatch.end()
        }
        
        
    }
    function skip(msg,serverqueue){
        if(!msg.member.voice.channel){
            return msg.channel.send("join channel first")

        }
        if(!serverqueue){
            return msg.channel.send('There is nothing to skip')
            serverqueue.connection.dispatch.end()
        }
    }
})
bot.login(token)