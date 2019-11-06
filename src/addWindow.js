const electron = require('electron');
const { ipcRenderer } = electron;

const Store = require('electron-store');
//set filename
const store = new Store({ name: 'data' });

const form = document.querySelector('form');
form.addEventListener('submit', submitForm);

let libraryColumns = [];

//Load form
document.addEventListener('DOMContentLoaded', function() {
	//load library
	if (store.get('library') != null) {
		let library = store.get('library');
		libraryColumns = library.columns;
	}
	const inputs = document.querySelector('#inputs');
	for (let i = 0; i < libraryColumns.length; i++) {
		const div = document.createElement('div');
		div.className = 'input-field';
		div.appendChild(createLabel(libraryColumns[i]));

		// Make sure only first input is autofocused
		if (i === 0) {
			div.appendChild(createInput(libraryColumns[i], true));
		} else {
			div.appendChild(createInput(libraryColumns[i], false));
		}

		inputs.append(div);
	}
});

function createLabel(column) {
	this[column] = document.createElement('label');
	this[column].className = 'active';
	this[column].for = column;
	this[column].append(column);
	return this[column];
}

function createInput(column, autofocus) {
	this[column] = document.createElement('input');
	this[column].id = column;
	this[column].type = 'text';
	this[column].required = true;
	this[column].autofocus = autofocus;
	return this[column];
}

function submitForm(e) {
	e.preventDefault();
	const item = {
		tag: `${document.querySelector(`#${libraryColumns[0]}`).value} ${
			document.querySelector(`#${libraryColumns[1]}`).value
		}`
	};
	for (let i = 0; i < libraryColumns.length; i++) {
		item[libraryColumns[i]] = document.querySelector(
			`#${libraryColumns[i]}`
		).value;
	}
	ipcRenderer.send('item:add', item);
}

function closeAddWindow() {
	ipcRenderer.send('addWindow:close');
}
