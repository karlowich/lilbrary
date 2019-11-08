const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron');
const Store = require('electron-store');
//set filename
const store = new Store({ name: 'library' });

// SET ENV
process.env.NODE_ENV = 'production';

// Keep a global reference of the window object
let mainWindow;
let addWindow;
let editWindow;
let newLibraryWindow;

function createMainWindow() {
	// Create the browser window.
	mainWindow = new BrowserWindow({
		width: 1000,
		height: 700,
		backgroundColor: '#fff',
		webPreferences: {
			nodeIntegration: true
		}
	});

	// and load the index.html of the app.
	mainWindow.loadFile('src/mainWindow.html');

	mainWindow.once('ready-to-show', () => {
		mainWindow.show();
	});
	// Emitted when the window is closed.
	mainWindow.on('closed', () => {
		mainWindow = null;
	});

	const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
	Menu.setApplicationMenu(mainMenu);
}

// Handle create add window
function createAddWindow(height) {
	// Create new window
	addWindow = new BrowserWindow({
		webPreferences: {
			nodeIntegration: true
		},
		backgroundColor: '#fff',
		width: 500,
		height: height,
		title: 'Add Item'
	});
	// Load html into window
	addWindow.loadFile('src/addWindow.html');

	addWindow.once('ready-to-show', () => {
		addWindow.show();
	});

	// Garbage collection handle
	addWindow.on('closed', function() {
		addWindow = null;
	});
}

// Handle create edit window
function createEditWindow(height, item) {
	// Create new window
	editWindow = new BrowserWindow({
		webPreferences: {
			nodeIntegration: true
		},
		backgroundColor: '#fff',
		width: 500,
		height: height,
		title: 'Edit Item'
	});
	// Load html into window
	editWindow.loadFile('src/editWindow.html');

	editWindow.once('ready-to-show', () => {
		editWindow.show();
	});

	// Send data to form
	editWindow.webContents.on('dom-ready', () => {
		editWindow.webContents.send('item:edit', item);
	});

	// Garbage collection handle
	editWindow.on('closed', function() {
		editWindow = null;
	});
}

// Handle create new library window
function createNewLibraryWindow() {
	// Create new window
	newLibraryWindow = new BrowserWindow({
		webPreferences: {
			nodeIntegration: true
		},
		backgroundColor: '#fff',
		width: 500,
		height: 400,
		title: 'New Library'
	});
	// Load html into window
	newLibraryWindow.loadFile('src/newLibraryWindow.html');

	newLibraryWindow.once('ready-to-show', () => {
		newLibraryWindow.show();
	});

	// Garbage collection handle
	newLibraryWindow.on('closed', function() {
		newLibraryWindow = null;
	});
}

// Catch item:add and store in data file
ipcMain.on('item:add', function(e, item) {
	let itemTags = store.get('tags');
	if (itemTags != null) {
		itemTags.push(item.tag);
	} else {
		itemTags = [item.tag];
	}
	//store item data
	store.set(item.tag, item);
	//store item tag
	store.set('tags', itemTags);

	updateTable();

	addWindow.close();
});

ipcMain.on('item:edit', function(e, item) {
	let itemTags = store.get('tags');
	if (itemTags != null) {
		itemTags.push(item.tag);
	} else {
		itemTags = [item.tag];
	}

	//store item data
	store.set(item.tag, item);
	//store item tag
	store.set('tags', itemTags);

	updateTable();

	editWindow.close();
});

ipcMain.on('table:load', function(e) {
	if (store.get('tags') != null) {
		updateTable();
	}
});

ipcMain.on('addWindow:open', function(e) {
	if (addWindow == null && editWindow == null) {
		let library = store.get('library');
		let windowHeight = 400;
		for (i = 4; i < library.columns.length; i++) {
			windowHeight += 100;
		}
		createAddWindow(windowHeight);
	}
});

ipcMain.on('addWindow:close', function(e) {
	addWindow.close();
});

ipcMain.on('editWindow:open', function(e, tag) {
	if (addWindow == null && editWindow == null) {
		let library = store.get('library');
		let windowHeight = 400;
		for (i = 4; i < library.columns.length; i++) {
			windowHeight += 100;
		}
		let item = store.get(tag);
		createEditWindow(windowHeight, item);
		deleteItem(tag);
	}
});

ipcMain.on('editWindow:close', function(e) {
	updateTable();
	editWindow.close();
});

ipcMain.on('library:new', function(e, item) {
	store.set('library', item);
	clearItems();
	newLibraryWindow.close();
	mainWindow.reload();
});

app.on('ready', createMainWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

app.on('activate', () => {
	// On macOS it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	if (win === null) {
		createWindow();
	}
});

const mainMenuTemplate = [
	{
		label: 'Menu',
		submenu: [
			{
				label: 'New Library',
				click() {
					dialog.showMessageBox(
						mainWindow,
						{
							type: 'question',
							buttons: ['No', 'Yes'],
							noLink: true,
							defaultId: 0,
							message: 'Do you really want to overwrite the library?'
						},
						response => {
							if (response === 1) {
								createNewLibraryWindow();
							}
						}
					);
				}
			},
			{ type: 'separator' },
			{
				label: 'Quit',
				// Checks if mac and adds keyboard command accordingly
				accelerator: process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
				click() {
					app.quit();
				}
			}
		]
	}
];

// If mac, add empty object to menu
if (process.platform == 'darwin') {
	mainMenuTemplate.unshift({});
}

// Add developer tools item if not in prod
if (process.env.NODE_ENV !== 'production') {
	mainMenuTemplate.push({
		label: 'Developer Tools',
		submenu: [
			{
				label: 'Toogle DevTools',
				accelerator: process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',
				click(item, focusedWindow) {
					focusedWindow.toggleDevTools();
				}
			},
			{
				role: 'reload'
			}
		]
	});
}

function updateTable() {
	// Start by clearing table
	mainWindow.webContents.send('table:clear');

	// Get item tags
	const tags = store.get('tags');

	// Update table for each tag
	for (let i = 0; i < tags.length; i++) {
		item = store.get(tags[i]);
		mainWindow.webContents.send('table:update', item);
	}
}

function clearItems() {
	let itemTags = store.get('tags');
	if (itemTags != null) {
		for (let i = 0; i <= itemTags.length; i++) {
			store.delete(itemTags[i]);
		}
		itemTags = [];
		store.set('tags', itemTags);
	}
}

function deleteItem(tag) {
	let itemTags = store.get('tags');
	let index = itemTags.indexOf(tag);
	if (index > -1) {
		itemTags.splice(index, 1);
	}
	store.set('tags', itemTags);
	store.delete(tag);
}
