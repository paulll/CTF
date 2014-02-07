function $(a){return document.getElementById(a);}

function TaskList(tasks) {
    this.element = document.createElement('div');
    this.element.className = 'tasklist';

    var self = this;

    tasks.forEach(function (task) {
        var root = document.createElement('div');
        var name = document.createElement('div');
        var tags = document.createElement('div');

        root.className = 'task';
        name.className = 'name';
        tags.className = 'tags';

        name.innerText = task.name;
        tags.innerText = task.tags.join(', ');

        root.appendChild(name);
        root.appendChild(tags);

        self.element.appendChild(root);
    });
}

function ScoreBoard(teams) {
    this.element = document.createElement('table');

    var root = this.element;

    this.fillScores = function (scores) {
        this.element.innerHTML = '';
        this.element.className = 'scoreboard';

        scores.sort(function (a,b){return b.place - a.place});

        scores.forEach(function(teamname){

            var team;

            for (var teamnum in teams) {
                if (teams[teamnum].name === teamname) {
                    team = teams[teamnum];
                }
            }

            var row = document.createElement('tr');
            var logo = document.createElement('td');
            var name = document.createElement('td');
            var score = document.createElement('td');

            logo.style.backgroundImage = 'http://10.0.0.1/data'+team.logo;

            name.innerText = team.name;
            score.innerText = team.score;

            row.appendChild(logo);
            row.appendChild(name);
            row.appendChild(score);

            row.onclick = function () {
                go('team/'+team.name);
            };

            root.appendChild(row);
        });
    }
}

function TextView(header, text, attaches){
    this.element = document.createElement('div');
    this.element.className = 'textview';

    var head = document.createElement('h1');
    head.innerText = header;

    var textContainer = document.createElement('div');
    textContainer.className = 'textContainer';
    textContainer.innerText = text;

    this.element.appendChild(head);
    this.element.appendChild(textContainer);

    var root = this.element;

    attaches.forEach(function(attachment){
        switch (attachment.type) {
            case 'file':
                var attachment_element = document.createElement('a');
                attachment_element.className = 'link attachment';
                attachment_element.innerText = 'Ссылка';
                attachment_element.href = 'http://10.0.0.1/data/'+attachment.uri;
                break;
            case 'image':
                var attachment_element = document.createElement('img');
                attachment_element.className = 'image attachment';
                attachment_element.src = 'http://10.0.0.1/data/'+attachment.uri;
                break;
            case 'video':
                var attachment_element = document.createElement('iframe');
                attachment_element.className = 'video attachment';
                attachment_element.src = 'https://www.youtube.com/embed/'+attachment.uri+'?feature=player_detailpage';
                break;
            case 'audio':
                var attachment_element = document.createElement('audio');
                attachment_element.className = 'audio attachment';
                attachment_element.src = 'http://10.0.0.1/data/'+attachment.uri;
                break;
        }
        root.appendChild(attachment_element);
    });
}

function FlagInput(task, callback){
    this.element = document.createElement('div');
    this.element.setAttribute('contenteditable', 'true');
    this.element.className = 'flaginput';

    var self = this;

    this.element.onkeydown = function(event) {
        if (event.keyCode == 20) {
            callback(self.element.innerText);
        }
    }
}

function GraphView(list) {

}

/*
 * ((1<<8)+(1<<7)+(1<<6)+(1<<5)+(1<<4)+(1<<3)+(1<<2)+(1<<1)+(1<<0)).toString(2).split('1').forEach(function(){return Array.prototype.forEach.call(this, function (a){String.fromCharCode()})})*/