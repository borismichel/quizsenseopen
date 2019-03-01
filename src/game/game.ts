import * as qs from '../qs/qs';
import * as bot from '../bot/bot';
import * as db from '../db/db';

export function startGame() {
    console.log('Game Online');
}

export function newQuestion (chat_id, gid) {
    console.log('Sending new Question')

    //Get stuff from engine here
    qs.qsPulldata()
    .then((data) => {
        let val_cor: number = data[2][1];
        let op1: number     = data[2][1]*Math.random();
        let op2: number     = data[2][1]*Math.random();

        let answer_array = ['A', 'B', 'C'];

        let question_array = [];

        let answer_corr = answer_array[Math.round(2*Math.random())];

        switch(answer_corr) {
            case 'A':
                question_array.push(val_cor);
                var answer_1 = 'B';
                question_array.push(op1);
                var answer_2 = 'C';
                question_array.push(op2);
                break;
            
            case 'B':
                var answer_1 = 'A';
                question_array.push(op1);
                question_array.push(val_cor);
                var answer_2 = 'C';
                question_array.push(op2);
                break;
            
            case 'C':
                var answer_1 = 'A';
                question_array.push(op1);
                var answer_2 = 'B';
                question_array.push(op2);
                question_array.push(val_cor);
                break;
        }

        let answerString = answer_corr + ' - ' + val_cor + ';' + answer_1 + ' - ' + op1 + ';' +answer_2 + ' - ' + op2;

        db.insertQuestion(gid, answerString, answer_corr, data[1][0], data[0][0]).then((qid) => {
            console.log('qid: ' + qid)
            bot.sendQ(chat_id, qid, 'What do you think is the ' + data[0][0].substring(0, 25) + ' per ' + data[1][0].substring(0, 25) + ' for ' + data[2][0].substring(0, 25) + '?', parseFloat(question_array[0]).toFixed(2), parseFloat(question_array[1]).toFixed(2), parseFloat(question_array[2]).toFixed(2));
        });
    })    
}