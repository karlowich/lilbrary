const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const Store = require('electron-store');
//set filename and file path
const store = new Store({ name: 'data' });

// SET ENV
process.env.NODE_ENV = 'dev';

// Keep a global reference of the window object
let mainWindow;
let addWindow;
let editWindow;

function createMainWindow() {
	// Create the browser window.
	mainWindow = new BrowserWindow({
		width: 1000,
		height: 700,
		webPreferences: {
			nodeIntegration: true
		}
	});

	// and load the index.html of the app.
	mainWindow.loadFile('src/mainWindow.html');

	// Emitted when the window is closed.
	mainWindow.on('closed', () => {
		mainWindow = null;
	});

	const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
	Menu.setApplicationMenu(mainMenu);
}

// Handle create add window
function createAddWindow() {
	// Create new window
	addWindow = new BrowserWindow({
		webPreferences: {
			nodeIntegration: true
		},
		width: 500,
		height: 400,
		title: 'Add Item'
	});
	// Load html into window
	addWindow.loadFile('src/addWindow.html');

	// Garbage collection handle
	addWindow.on('closed', function() {
		addWindow = null;
	});
}

// Handle create edit window
function createEditWindow(item) {
	// Create new window
	editWindow = new BrowserWindow({
		webPreferences: {
			nodeIntegration: true
		},
		width: 500,
		height: 400,
		title: 'Edit Item'
	});
	// Load html into window
	editWindow.loadFile('src/editWindow.html');

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
		width: 500,
		height: 400,
		title: 'New Library'
	});
	// Load html into window
	newLibraryWindow.loadFile('src/newLibraryWindow.html');

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
	createAddWindow();
});

ipcMain.on('editWindow:open', function(e, tag) {
	let item = store.get(tag);
	createEditWindow(item);
	deleteItem(tag);
});

ipcMain.on('editWindow:close', function(e) {
	updateTable();
	editWindow.close();
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
					createNewLibraryWindow();
				}
			},
			{
				label: 'Update Items',
				click() {
					updateTable();
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

function deleteItem(tag) {
	let itemTags = store.get('tags');
	let index = itemTags.indexOf(tag);
	if (index > -1) {
		itemTags.splice(index, 1);
	}
	store.set('tags', itemTags);
	store.delete(tag);
}
