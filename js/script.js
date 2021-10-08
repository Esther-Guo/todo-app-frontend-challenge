/* global variables */
const todoInput = document.getElementById('todo-input');
const todoList = document.getElementById('todo-list');
const itemsCount = document.getElementById('items-count');
const clear = document.getElementById('clear-completed');
const filter = document.querySelectorAll('input[name="filter"]');

let currentFilter = 'all';
let todos = [];
let todoId = 0;
const LOCAL_TODOS = 'local_todos';

/* event listeners */
clear.addEventListener('click', () => {
    const toRemove = todos.filter((obj) => obj.active === false);
    if (toRemove.length > 0 && confirm(`You are about to remove ${toRemove.length} completed task(s). Are you sure?`)) {
        toRemove.forEach((elem) => {
            removerElem(elem.DOMelem);
        });
    }
});

todoInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
        if (e.target.value !== '') {
            addElem(e.target.value);
            todoInput.value = '';
            refreshFilter();
        }
    }
});

filter.forEach((f) => {
    f.addEventListener('change', filterCallback); // 为啥不加括号？
});

/* filter functions */
function refreshFilter() {
    if (currentFilter === 'completed') {
        showCompleted();
    }
    else if (currentFilter === 'all') {
        showAll();
    }
    else {
        showActive();
    }
}

function filterCallback(e) {
    currentFilter = e.target.value;
    refreshFilter();
}

function showAll() {
    todos.forEach(function (item) {
        if (item.DOMelem.classList.contains('todo-element-hide')) {
            item.DOMelem.classList.remove('todo-element-hide');
        }
    });
}

function showCompleted() {
    todos.forEach(function (item) {
        if (item.active && !item.DOMelem.classList.contains('todo-element-hide')) {
            item.DOMelem.classList.add('todo-element-hide');
        }
        else if (!item.active && item.DOMelem.classList.contains('todo-element-hide')) {
            item.DOMelem.classList.remove('todo-element-hide');
        }
    });
}

function showActive() {
    todos.forEach(function (item) {
        if (item.active && item.DOMelem.classList.contains('todo-element-hide')) {
            item.DOMelem.classList.remove('todo-element-hide');
        }
        else if (!item.active && !item.DOMelem.classList.contains('todo-element-hide')) {
            item.DOMelem.classList.add('todo-element-hide');
        }
    });
}

/* update function */
function updateCount() {
    let count = todos.reduce((count, item) => {
        if (item.active) count++;
        return count;
    }, 0);
    itemsCount.innerHTML = count;
}

function updateCurrentId() {
    if (!todos.length) {
        todoId = 0;
    }
    else {
        todoId = todos[todos.length-1].id + 1; // why not todos.length?
    }
}

/* local storage functions*/
function getLocalStorage() {
    if (localStorage.getItem(LOCAL_TODOS) === null) {
        localStorage.setItem(LOCAL_TODOS, JSON.stringify([]));
    }
    else if (JSON.parse(localStorage.getItem(LOCAL_TODOS)).length) {
        todos = JSON.parse(localStorage.getItem(LOCAL_TODOS));
        todos.forEach((item) => {
            if (todoId < +item.id) todoId = +item.id;
            addElem(item.content, false);
        });
        todoId++;
    }
    updateCount();
}

function updateLocalStorage() {
    localStorage.setItem(LOCAL_TODOS, JSON.stringify(todos));
}

function removefromStorage(id) {
    todos = todos.filter((item) => {
        return item.id !== +id;
    });
    updateLocalStorage();
}

/* todo list manipulation */
function changeActiveStatus(elem) {
    elem.classList.toggle('todo-element-check');
    let isActive = true;
    if (elem.classList.contains('todo-element-check')) {
        isActive = false;
    }
    todos.forEach((item) => {
        if (item.id === +elem.id) item.active = isActive;
    });
    updateLocalStorage();
    updateCount();
}

function removerElem(elem) {
    elem.remove();
    removefromStorage(+elem.id);
    updateCurrentId();
    updateCount();
    refreshFilter();
}

function addElem(inputText, isNew=true) {
    const item = document.createElement('li');
    item.classList.add('todo-element');
    item.id = ''+ todoId;
    item.innerHTML = `
        <button class="btn todo-check">
            <img src="./images/icon-check.svg" />
        </button>
        <p>${inputText}</p>
        <button class="btn todo-delete">
            <img src="./images/icon-cross.svg" />
        </button>
    `;
    if (isNew) {
        todos.push({
            active: true,
            content: inputText,
            DOMelem: item,
            id: todoId++,
        });
        updateLocalStorage();
    }
    else {
        todos.forEach((arrayObj) => {
            if (arrayObj.id === todoId) {
                arrayObj.DOMelem = item;
                if (!arrayObj.active) {
                    item.classList.add('todo-element-check');
                }
            }
        });
    }
    todoList.appendChild(item);

    const itemDelete = item.querySelector('.todo-delete');
    itemDelete.addEventListener('click', function() {
        removerElem(item);
    });

    const itemCheck = item.querySelector('.todo-check');
    itemCheck.addEventListener('click', function() {
        changeActiveStatus(item);
        refreshFilter();
    });

    updateCount();
}

/* initialization */
function init() {
    const starter = [
        'Complete online JS course',
        'Jog around the park',
        '10 minutes meditation',
        'Read for 1 hour',
        'Pick up groceries',
        'Complete Todo app project',
    ];
    if (localStorage.getItem('isFirstVisit') === null || localStorage.getItem('isFirstVisit') === false) {
        localStorage.setItem("isFirstVisit", true);
        starter.forEach((item) => {
            addElem(item);
        });
        changeActiveStatus(todos[0].DOMelem); // mark first item as 'checked'
    }
    else {
        getLocalStorage();
    }
}

init()