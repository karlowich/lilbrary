const electron = require('electron');
const Store = require('electron-store');
//set filename
const store = new Store({ name: 'data' });

const { ipcRenderer } = electron;

const tbody = document.querySelector('tbody');
const thead = document.querySelector('thead');

let libraryColumns = [];

document.addEventListener('DOMContentLoaded', function() {
	//load library
	if (store.get('library') != null) {
		let library = store.get('library');
		libraryColumns = library.columns;
		let libraryTitle = library.title;
		document.querySelector('#library-title').innerHTML = libraryTitle;

		//load table headers
		const tr = document.createElement('tr');
		for (let i = 0; i < libraryColumns.length; i++) {
			tr.appendChild(createTh(libraryColumns[i], i));
		}
		thead.append(tr);
	}

	// load data
	ipcRenderer.send('table:load');
});

function createTh(column, index) {
	this[column] = document.createElement('th');
	this[column].className = 'table-header';
	// add sort function to each header
	this[column].setAttribute('onclick', `sortTable(${index})`);
	this[column].append(column);
	return this[column];
}

// Update table
ipcRenderer.on('table:update', function(e, item) {
	const tr = document.createElement('tr');
	for (let i = 0; i < libraryColumns.length; i++) {
		tr.appendChild(createTd(libraryColumns[i], item));
	}
	tbody.append(tr);
	sortTable(0, true);
});

function createTd(column, item) {
	this[column] = document.createElement('td');
	this[column].className = column;
	this[column].append(item[column]);
	return this[column];
}

ipcRenderer.on('table:clear', function() {
	//clear tbody
	tbody.innerHTML = '';
});

function openAddWindow() {
	let row = document.querySelector('.selected');
	let tag;
	if (row != null) {
		tag = `${row.querySelector(`.${libraryColumns[0]}`).innerHTML} ${
			row.querySelector(`.${libraryColumns[1]}`).innerHTML
		}`;
	} else {
		tag = null;
	}

	ipcRenderer.send('addWindow:open', tag);
}

function openEditWindow() {
	let row = document.querySelector('.selected');
	let tag = `${row.querySelector(`.${libraryColumns[0]}`).innerHTML} ${
		row.querySelector(`.${libraryColumns[1]}`).innerHTML
	}`;
	ipcRenderer.send('editWindow:open', tag);
}

//from w3school
function sortTable(n, alwaysAsc) {
	let table, rows, switching, i, x, y, shouldSwitch, dir;
	let switchcount = 0;
	table = document.getElementById('mainTable');
	switching = true;
	dir = 'asc';

	while (switching) {
		switching = false;
		rows = table.rows;

		for (i = 1; i < rows.length - 1; i++) {
			shouldSwitch = false;
			x = rows[i].getElementsByTagName('td')[n];
			y = rows[i + 1].getElementsByTagName('td')[n];

			if (dir == 'asc') {
				if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
					shouldSwitch = true;
					break;
				}
			} else if (dir == 'desc') {
				if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
					shouldSwitch = true;
					break;
				}
			}
		}
		if (shouldSwitch) {
			rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
			switching = true;
			switchcount++;
		} else {
			if (alwaysAsc != true) {
				if (switchcount == 0 && dir == 'asc') {
					dir = 'desc';
					switching = true;
				}
			}
		}
	}
}

//from w3school modified
function searchTable() {
	var input, filter, table, tr, i, txtValue;

	input = document.getElementById('search');
	filter = input.value.toUpperCase();
	table = document.querySelector('#mainTable tbody');
	tr = table.getElementsByTagName('tr');

	// Loop through all table rows, and hide those who don't match the search query
	for (i = 0; i < tr.length; i++) {
		tds = tr[i].querySelectorAll('td');

		if (tds.length) {
			txtValue = tr[i].innerText.trim();

			if (txtValue.toUpperCase().indexOf(filter) > -1) {
				tr[i].style.display = '';
			} else {
				tr[i].style.display = 'none';
			}
		}
	}
}

// highlight selected row
let selected = document.getElementsByClassName('selected');
tbody.onclick = rowSelect;
tbody.ondblclick = rowDeSelect;

function rowSelect(e) {
	if (selected[0]) {
		selected[0].className = '';
	}

	e.target.parentNode.className = 'selected';
}

function rowDeSelect() {
	if (selected[0]) {
		selected[0].className = '';
	}
}
