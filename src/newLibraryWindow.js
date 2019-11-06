const electron = require('electron');
const { ipcRenderer } = electron;

let numberOfColumns = 0;

const form = document.querySelector('form');
form.addEventListener('submit', submitForm);

function createColumnInput() {
	numberOfColumns++;
	const inputs = document.querySelector('#inputs');
	const div = document.createElement('div');
	div.className = 'input-field';
	div.appendChild(createInput(`column${numberOfColumns}`));
	div.append(createSpan());
	inputs.append(div);
	// focus new input
	const newColumnInput = document.querySelector(`#column${numberOfColumns}`);
	newColumnInput.focus();
}

function removeColumnInput() {
	const lastColumnInput = document.querySelector(`#column${numberOfColumns}`);
	lastColumnInput.remove();
	numberOfColumns--;
}

function createInput(column) {
	this[column] = document.createElement('input');
	this[column].className = 'validate';
	this[column].id = column;
	this[column].type = 'text';
	this[column].required = true;
	this[column].pattern = '[a-zA-Z0-9-]+';
	return this[column];
}

function createSpan() {
	span = document.createElement('span');
	span.className = 'helper-text';
	span.setAttribute('data-error', 'Please only enter letters or numbers');
	return span;
}

function submitForm(e) {
	e.preventDefault();
	const item = {
		title: document.querySelector(`#library-title`).value,
		columns: []
	};
	for (let i = 1; i <= numberOfColumns; i++) {
		item.columns.push(document.querySelector(`#column${i}`).value);
	}

	ipcRenderer.send('library:new', item);
}