const electron = require('electron');
const { ipcRenderer } = electron;

const form = document.querySelector('form');
form.addEventListener('submit', submitForm);

const columns = ['composer', 'title', 'year'];

//Load form
document.addEventListener('DOMContentLoaded', function() {
	let inputs = document.querySelector('#inputs');
	for (let i = 0; i < columns.length; i++) {
		const div = document.createElement('div');
		div.className = 'input-field';
		div.appendChild(createLabel(columns[i]));

		// Make sure only first input is autofocused
		if (i === 0) {
			div.appendChild(createInput(columns[i], true));
		} else {
			div.appendChild(createInput(columns[i], false));
		}

		inputs.append(div);
	}
});

function createLabel(column) {
	this[column] = document.createElement('label');
	this[column].className = 'active';
	this[column].for = column;
	// make sure first letter is capital
	this[column].append(column.charAt(0).toUpperCase() + column.slice(1));
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
		composer: formValue('#composer'),
		tag: `${formValue('#composer')} ${formValue('#title')}`,
		title: formValue('#title'),
		year: formValue('#year')
	};

	ipcRenderer.send('item:add', item);
}

function formValue(id) {
	return document.querySelector(id).value;
}
