import * as cfg         from '../config/config';
import * as TelegramBot from 'node-telegram-bot-api';
import * as db          from '../db/db';
import * as game        from '../game/game';

const bot = new TelegramBot(cfg.botToken, {polling: true,  request: {proxy: cfg.proxy}}); //TEST

export function sendQ(id, qid, q, a1, a2, a3) {
    console.log('Sending question');
    bot.sendMessage(id, q,{
        parse_mode: 'Markdown',
        reply_markup: {
            inline_keyboard: [[
              {
                text: 'A: '+ a1,
                callback_data: qid + '_' + 'A'
              }],[{
                text: 'B: '+ a2,
                callback_data: qid + '_' + 'B'
              }],[{
                text: 'C: '+ a3,
                callback_data: qid + '_' + 'C'
              }
            ]]
          }
    })    
}

//Message Handlers

bot.on('message', (msg) => {
    var from = msg.from;
    var sender_id = msg.chat.id;

    db.checkUser(sender_id)
    .then((result) => {
        if(result=='no_user') {
            console.log('Unknown User - Creating');
            db.insertUser(from, sender_id).then((result) => {
                console.log(result);
            })
        }
    });

    bot.sendMessage(sender_id, 'Hello ' + from.first_name, {
        parse_mode: 'Markdown',
        reply_markup: {
            inline_keyboard: [[
                {
                text: 'New Game',
                callback_data: 'ng_'
                }
            ]]
            }
    })  
})

//Callback Handlers
bot.on('callback_query', (data) => {
    var chat_id = data.from.id;
    console.log(data);
    if (data.data.substring(0, 3).toUpperCase() == 'NG_') {
        //new game
        db.newGame(data.from.id)
        .then((game_id) => {
            game.newQuestion(chat_id, game_id)
        })
    } else {
        // received answer
        let qid = data.data.substring(0, data.data.length - 2);
        console.log('data qid: ' + qid);
        let reply = data.data.slice(-1);
        console.log('data reply: ' + reply);
        let gid = qid.substring(qid.indexOf('_')+1);
        console.log('data gid: ' + gid);

        db.checkQuestionActive(qid).then((status:any) => {
            if(status) {
                
                //validate Answer
                db.checkAnswerandUpdate(qid, reply)
                .then((answer: any) => {
                    console.log(answer);
                    if (answer[0] == 'true') {
                        console.log('Yay!, score: ' + answer[1]);
                        bot.sendMessage(chat_id, '*Correct!* Your score for this answer: ' + answer[1], {parse_mode: 'Markdown'});                        
                    } else {
                        console.log('Nay');
                        bot.sendMessage(chat_id, 'Your answer was wrong. Your remaining lives: *' + answer[2] +'*', {parse_mode: 'Markdown'})
                    }
                    if (answer[2] > 0) {
                        // new question
                        console.log('Still lives remaining!')
                        game.newQuestion(chat_id, gid);
                    } else {
                        // game over
                        console.log('No lives remaining!')
                        db.gameOver(gid).then((score) => {
                            console.log('final score: ' + score);
                            bot.sendMessage(chat_id, '*GAME OVER* :( your final score was *' + score + '*', {
                                parse_mode: 'Markdown',
                                reply_markup: {
                                    inline_keyboard: [[
                                      {
                                        text: 'New Game',
                                        callback_data: 'ng_'
                                      }
                                    ]]
                                  }
                            })  
                        })
                    }

                })
            }
            else {
                bot.sendMessage(data.from.id, 'This question has *already been answered* or has *expired*.', {parse_mode: 'Markdown'})
            }
        })

        
    }
})