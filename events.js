/*

 Event types

 * Server events


 - update Scores


 * Client events

 - check Flag
 - check Answer
 - buy Task

 * Client requests

 - get Constants [teams, current team]
 - get Task
 - get Tasks
 - get Question
 - get Quest
 - get News
 - get Scores

 */

var db, broadcast;

exports._setDbHandler = function (dbHandler) {
    db = dbHandler;
};

exports._setBroadcaster = function (broad) {
    broadcast = broad;
};

// Client public events

exports.checkFlag = function (event, teamid, send) {

    // Obj @event
    //       tid : Task identifier
    //       flag: Flag
    // Str @teamid
    // Fx  @send (what)

    db.get({
        type: 'task',
        tid: event.tid
    }, function (taskData) {
        if (taskData.flag === event.flag) {

            if (taskData.solvedBy) {
                taskData.solvedBy.push(teamid);
            } else {
                taskData.solvedBy = [ teamid ];
            }

            db.set({
                type: 'task',
                tid: event.tid
            }, {
                $push: {
                    solvedBy: teamid
                }
            });

            db.set({
                type: 'team',
                tid: teamid
            }, {
                $push: {
                    solved: event.tid
                },
                $inc: {
                    score: taskData.score,
                    keys: taskData.cost * -1
                }
            });

            db.get({
                type: 'team',
                teamid: teamid
            }, function (team) {
                broadcast({
                    type: 'solveTask',
                    teamid: teamid,
                    teamname: team.name,
                    taskname: taskData.name,
                    tid: event.tid
                });
            });

            send({success: 1});
        } else {
            send({success: 0});
        }
    });
};

exports.checkAnswer = function (event, teamid, send) {

    // event {
    //      qid:    question identifier
    //      answer: answer
    // }
    // teamid: string
    // send: function (msg)

    db.get({
        type: 'question',
        qid: event.qid
    }, function (questionData) {

        // can be multiple answer variants

        if (questionData.answer.indexOf(event.answer) !== -1) {
            db.set({
                type: 'question',
                qid: event.qid
            }, {
                $push: {
                    solvedBy: teamid
                }
            });

            db.set({
                type: 'team',
                qid: teamid
            }, {
                $push: {
                    questSolved: event.qid
                },
                $inc: {
                    keys: questionData.keys
                }
            });

            send({success: 1});

        } else {
            send({success: 0});
        }
    });
};

exports.buyTask = function (event, teamid, send) {
    // event {
    //      tid: task id
    // }
    // teamid: string
    // send: function (msg)

    db.get({
        type: 'task',
        tid: event.tid
    }, function (taskData) {
        db.get({
            type: 'team',
            teamid: teamid
        }, function (teamData) {
            if (teamData.keys >= taskData.keys) {
                db.set({
                    type: 'team',
                    teamid: teamid
                }, {
                    $inc: {
                        keys: taskData.keys * -1
                    },
                    $push: {
                        openedTasks: taskData.tid
                    }
                });
                send({success: 1});
            } else {
                send({success: 0});
            }
        });
    });
};

// Client private events

exports.getTasks = function (event, teamid, send) {
    db.get({
        type: 'team',
        teamid: teamid
    }, function (teamData) {
        var tasks;
        teamData.openedTasks.forEach(function (tid) {
            db.get({
                type: 'task',
                tid: tid
            }, function (task) {
                tasks.push({
                    tid: tid,
                    name: task.name,
                    subjects: task.subjects
                });
                if (task.length === teamData.openedTasks.length) {
                    send({list: tasks, success: 1});
                }
            });
        });
        if (teamData.openedTasks.length == 0) {
            send({list: [], success: 1})
        }
    });
};

exports.getTask = function (event, teamid, send) {
    // event {tid}
    db.get({
        type: 'team',
        teamid: teamid
    }, function (teamData) {
        if (teamData.openedTasks.indexOf(event.tid) !== -1) {
            db.get({
                type: 'task',
                tid: event.tid
            }, function (task) {
                send({
                    tid: tid,
                    keys: task.keys,
                    score: task.score,
                    task: task.task, // task main data
                    solved: task.solvedBy,
                    name: task.name,
                    subjects: task.subjects,
                    success: 1
                });
            });
        } else {
            send({success: 0});
        }
    });
};

exports.getQuest = function (event, teamid, send) {
    console.time('get quest');
    db.get({
        type: 'team',
        teamid: teamid
    }, function (teamData) {
        var opens = {};
        teamData.questSolved.forEach(function (questid, i) {
            db.get({
                type: 'question',
                qid: questid
            }, function (quest) {
                quest.nexts.forEach(function (nextQuest, ii) {
                    db.get({
                        type: 'question',
                        qid: nextQuest
                    }, function (nextQuestData) {
                        if (opens[nextQuest]) {
                            opens[nextQuest] = +1 / nextQuestData.needs;
                        } else {
                            opens[nextQuest] = 1 / nextQuestData.needs;
                        }
                        if (i == teamData.length - 1 && ii == quest.nexts.length - 1) {
                            var ret = [];
                            for (var qid in opens) {
                                if (opens[qid] >= 1) {
                                    ret.push(qid);
                                }
                            }
                            send({list: ret, success: 1});
                            console.timeEnd('get quest');
                        }
                    });
                });
            });
        });
    });
};

exports.getQuestion = function (event, teamid, send) {
    db.get({
        type: 'team',
        teamid: teamid
    }, function (teamData) {
        var need = 0;
        db.get({
            type: 'question',
            qid: event.qid
        }, function (targetQuest) {
            teamData.questSolved.forEach(function (questid, i) {
                db.get({
                    type: 'question',
                    qid: questid
                }, function (quest) {
                    quest.nexts.forEach(function (nextQuest) {
                        if (nextQuest == event.qid) {
                            need = +1 / targetQuest.needs;
                            if (need == 1) {
                                send({
                                    success: 1,
                                    name: targetQuest.name,
                                    qid: event.qid,
                                    task: task.task, // task main data
                                    solved: task.solvedBy
                                });
                            } else if (i == teamData.questSolved.length - 1) {
                                send({success: 0});
                            }
                        }
                    });
                });
            });
        });
    });
};

exports.getScores = function (event, teamid, send) {
    db.get({
        type: 'teams'
    }, function (teams) {

        var teams_new = [];

        teams.forEach(function (team) {
            teams_new.push(team.teamid);
        });

        send({success: 1, list: teams_new});
    });
};

exports.getNews = function (event, teamid, send) {
    db.get({
        type: 'news'
    }, function (news) {
        send({list: news, success: 1});
    });
};

exports.getInitials = function (event, teamid, send) {
    db.get({
        type: 'team',
        teamid: teamid
    }, function (team) {
        send({
            success: 1,
            name: team.name,
            score: team.score
        });
    });
};
