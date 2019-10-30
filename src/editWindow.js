const electron = require('electron');
const { ipcRenderer } = electron;

const form = document.querySelector('form');
form.addEventListener('submit', submitForm);

// Fill form with data from row
ipcRenderer.on('item:edit', function(e, item) {
	document.querySelector('#composer').value = item.composer;
	document.querySelector('#title').value = item.title;
	document.querySelector('#year').value = item.year;
});

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

function closeEditWindow() {
	ipcRenderer.send('editWindow:close');
}
