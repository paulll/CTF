var MongoClient = require('mongodb').MongoClient;
var admin = require('./admin');
var DB;

// подсоединяемся к БД
function DBconnect() {
    MongoClient.connect('mongodb://127.0.0.1:27017', function (err, db) {
        if (err) {
            admin.log('[DB]', '[Error]', err.err);
            console.log('reconnecting...');
            setTimeout(DBconnect, 1000);
        } else {
            console.log('[DB]', 'Connected to mongodb at :27017');
            DB = db;
        }
    });
}

exports.get = function (what, callback) {
    switch (what.type) {
        case 'task':
            DB.collection('tasks').find({tid: what.tid}).toArray(function (error, list) {
                if (error) {
                    console.log('[DB]', '[Error]', error);
                } else {
                    callback(list[0]);
                }
            });
            break;
        case 'tasks':
            DB.collection('tasks').find({}).toArray(function (error, list) {
                if (error) {
                    console.log('[DB]', '[Error]', error);
                } else {
                    callback(list);
                }
            });
            break;
        case 'quest':
            DB.collection('quest').find({}).toArray(function (error, list) {
                if (error) {
                    console.log('[DB]', '[Error]', error);
                } else {
                    callback(list);
                }
            });
            break;
        case 'question':
            DB.collection('tasks').find({qid: what.qid}).toArray(function (error, list) {
                if (error) {
                    console.log('[DB]', '[Error]', error);
                } else {
                    callback(list[0]);
                }
            });
            break;
        case 'teams':
            DB.collection('teams').find({}).toArray(function (error, list) {
                if (error) {
                    console.log('[DB]', '[Error]', error);
                } else {
                    callback(list);
                }
            });
            break;
        case 'team':
            DB.collection('team').find({teamid: what.teamid}).toArray(function (error, list) {
                if (error) {
                    console.log('[DB]', '[Error]', error);
                } else {
                    callback(list[0]);
                }
            });
            break;
        case 'news':
            DB.collection('news').find({}).toArray(function (error, list) {
                if (error) {
                    console.log('[DB]', '[Error]', error);
                } else {
                    callback(list);
                }
            });
            break;
        case 'teamBySubnet':
            DB.collection('teams').find({subnet: what.subnet}).toArray(function (error, list) {
                if (error) {
                    console.log('[DB]', '[Error]', error);
                } else {
                    callback(list[0].teamid);
                }
            });
            break;
    }
}

exports.set = function (what) {
    switch (what.type) {
        case 'team':

            // @inputs:
            // - teamid   - Team identifier
            // - replacer - New team data

            DB.collection('teams').update({teamid: what.teamid}, what.replacer);
            break;
        case 'teamsInsert':

            // @inputs:
            // - teamdata - Team object

            DB.collection('teams').insert(what.teamdata, {w: 1});
            break;
        case 'task':

            // @inputs:
            // - tid      - Task identifier
            // - replacer - New task data

            DB.collection('tasks').update({tid: what.tid}, what.replacer);

            break;
        case 'newsInsert':

            // @inputs:
            // - newsdata - message object

            DB.collection('news').insert(what.newsdata, {w: 1})

            break;
        case 'quest':

            // @inputs:
            // - qid      - Quest question identifier
            // - replacer - Question object

            DB.collection('quest').update({qid: what.qid}, what.replacer);

            break;
    }
}