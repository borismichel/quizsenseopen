import * as sqlite3 from 'sqlite3';
import { resolve } from 'dns';

var db = new sqlite3.Database('./src/db/db.db');   //resources

export function checkUser(chat_id) {
    
    return new Promise((resolve, reject) => {
        
        var sql = 'SELECT id FROM users WHERE chatid =' + chat_id;

        db.all(sql, function(err, rows) {
            if(rows){
                console.log('User exists: ' + chat_id);
                resolve(rows); //user exists
            } else {
                resolve('no_user')
            }
        })  
    });
};

export function insertUser(from, chat_id) {

    return new Promise((resolve, reject) => {
        
        var sql = 'INSERT INTO users (firstname, lastname, chatid) VALUES (?, ?, ?)';

        db.run(sql, from.first_name, from.last_name, chat_id);

        resolve('success');
    });
};

export function insertQuestion(gid, as, ca, dim, msr) {
    console.log(gid);
    return new Promise((resolve, reject) => {
        //get current sequence/streak
        var sql = 'SELECT sequence, streak FROM questions WHERE game_id ="' + gid + '" ORDER BY sequence DESC';
        db.all(sql, function (err, rows) {
            if(rows.length>0) {

                resolve(rows[0])
            } else {
                resolve('no_q')
            }
        })
    }).then((row: any) => {
        let sql = 'INSERT INTO questions (id, game_id, sequence, streak, dim, msr, answer_all, answer_corr, active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
        
        if(row=='no_q') {
            var nseq = 1;
            var nstreak = 1;
        } else {
            var nseq: number= row.sequence + 1;
            var nstreak: number = row.streak + 1;
        }

        db.run(sql, nseq+'_'+gid, gid, nseq, nstreak, dim, msr, as, ca, true)

        return nseq+'_'+gid;
    })
};

export function checkAnswerandUpdate(qid, reply) {
    var gid = qid.substring(qid.indexOf('_')+1);
    console.log(gid);
    // Get correct answer
    var p1 = new Promise( (resolve, reject) => {
        let sql = 'SELECT answer_corr FROM questions WHERE id ="' + qid + '"';

        db.all(sql, (err, rows) => {
            if(rows[0].answer_corr==reply) {
                resolve('true');
            } else {                
                resolve('false');
            }
        })
    })

    // Get current streak
    var p2 = new Promise((resolve, reject) => {
        let sql = 'SELECT streak FROM questions WHERE id ="' + qid + '"';

        db.all(sql, function (err, rows) {
            if(rows.length>0) {
                resolve(rows[0].streak)
            } else {
                resolve('no_q')
            }
        })
    })

    // Get lives
    var p3 = new Promise((resolve, reject) => {
        let sql = 'SELECT lives FROM game WHERE id ="' + gid + '"';

        db.all(sql, (err, rows) => {
            console.log(sql);
            console.log(rows);
            resolve(rows[0].lives);
        })
    })

    return Promise.all([p1, p2, p3]).then((results: any) => {
        var score;
        var lives;

        if (results[0] == 'true') {
            score = Math.ceil(results[1]/3) * 50; //Sequential Score Streak increase
            let sql = 'UPDATE questions SET score = ' + score +', user_reply = "' + reply + '", correct = true, active = false WHERE id ="' + qid + '"';
            lives = results[2];
            db.run(sql);
        } else {
            score = 0;
            let streak = (results[1] > 5) ? results[1] - 5 : 1; //Streak penalty
            console.log(streak);
            let sql = 'UPDATE questions SET score = ' + score + ', streak = ' + streak + ', user_reply = "' + reply + '", correct = false, active = false WHERE id ="' + qid + '"';
            db.run(sql);
            //take live!
            lives = results[2]-1;
            console.log('lives: ' + lives)
            sql = 'UPDATE game SET lives = ' + lives + ' WHERE id ="' + gid + '"';
            db.run(sql);
        }
        return ([results[0], score, lives]);
    })
}

export function checkQuestionActive(qid) {

    return new Promise((resolve, reject) => {
        let sql = 'SELECT active FROM questions WHERE id="' + qid + '"';
        
        db.all(sql, (err, rows) => {
            resolve(rows[0].active)
        })

    })
}

export function gameOver(gid) {

    return new Promise((resolve, reject) => {
        let sql = 'SELECT SUM(score) as totalScore FROM questions WHERE game_id="' + gid + '" GROUP BY "' + gid + '";';

        db.all(sql, (err, rows) => {
            resolve(rows[0].totalScore)
        })
    }).then((score) => {
        let sql = 'UPDATE game SET status = "over", finalscore = ' + score + ' WHERE id = "' + gid + '";';
        
        db.run(sql);
        return score;
    })

}

export function newGame(chat_id) {
    let time = new Date().getTime();
    let game_id: string = time + '_' + chat_id;
    return new Promise((resolve, reject) => {
        let sql = 'INSERT INTO game (id, chat_id, lives, status) VALUES (?, ?, ?, ?);'
    
        db.run(sql, game_id, chat_id, 3, 'active');
    
        resolve(game_id);
    })
}
/*
//functions for own use

var report = (name, msg, result, cid, ctype) => {
        var db = new sqlite3.Database(ldb);   
        var ts = Date().toString();
        // console.log(ts);
        // var sql = "INSERT INTO his (fname, name, time, query, chatid) VALUES ('"
        //     + fn + "','"   
        //     + ln + "','"   
        //     + Date.now + "','"   
        //     + qry + "','"   
        //     + cid              
        //     +")"
        var sql = "INSERT INTO log (timestamp, name, message, result, chatid, contact_type) VALUES ('" + ts + "', ?, ?, ?, ?, ?)"
        // console.log(sql);
        db.run(sql, name, msg, result, cid, ctype);
    }

*/