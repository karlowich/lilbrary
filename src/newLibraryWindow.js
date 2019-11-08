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
	const buttons = document.querySelector('.btn');
	buttons.scrollIntoView();
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
	this[column].pattern = "[^' ']+";
	return this[column];
}

function createSpan() {
	span = document.createElement('span');
	span.className = 'helper-text';
	span.setAttribute('data-error', 'No spaces allowed');
	return span;
}

function submitForm(e) {
	e.preventDefault();
	if (numberOfColumns < 2) {
		const div = document.querySelector('#intersection');
		const error = document.createElement('span');
		error.append('You must have atleast 2 columns');
		error.id = 'error';
		div.appendChild(error);
		return false;
	}
	const item = {
		title: document.querySelector(`#library-title`).value,
		columns: []
	};
	for (let i = 1; i <= numberOfColumns; i++) {
		item.columns.push(document.querySelector(`#column${i}`).value);
	}

	ipcRenderer.send('library:new', item);
}
