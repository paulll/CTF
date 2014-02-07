// open tasks view
$('menu-tasks').onclick = function () {
    request({
        type: 'getTasks'
    }, function (response) {
        if (response.success) {
            var taskList = new TaskList(response.list);
            $('content').innerHTML = '';
            $('content').appendChild(taskList.element);
        }
    });
};

// open quest view
$('menu-quest').onclick = function () {
    request({
        type: 'getQuest'
    }, function (response) {
        if (response.success) {
            var tree = new TreeView(response.list);
            $('content').innerHTML = '';
            $('content').appendChild(tree.element);
        }
    });
};

// open scoreboard view
$('menu-scoreboard').onclick = function () {

};

// open news view
$('menu-news').onclick = function () {

};