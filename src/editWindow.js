const electron = require('electron');
const { ipcRenderer } = electron;

const form = document.querySelector('form');
form.addEventListener('submit', submitForm);

function submitForm(e) {
	e.preventDefault();
	const item = {
		composer: formValue('#composer'),
		tag: `${formValue('#composer')} ${formValue('#title')}`,
		title: formValue('#title'),
		year: formValue('#year')
	};

	ipcRenderer.send('item:edit', item);
}

function formValue(id) {
	return document.querySelector(id).value;
}
