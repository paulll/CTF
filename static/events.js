// open tasks view
$('menu-tasks').onclick = function () {
    request({
        type: 'getTasks'
    }, function (response) {
        if (response.success) {
            var taskList = new TaskList(response.list);
        }
    });
};

// open quest view
$('menu-quest').onclick = function () {

};

// open scoreboard view
$('menu-scoreboard').onclick = function () {

};

// open news view
$('menu-news').onclick = function () {

};