const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const Store = require('electron-store');
//set filename and file path
const store = new Store({ name: 'data', cwd: `${app.getAppPath()}/data` });

// SET ENV
process.env.NODE_ENV = 'dev';

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
let addWindow;

function createMainWindow() {
	// Create the browser window.
	mainWindow = new BrowserWindow({
		width: 800,
		height: 600,
		webPreferences: {
			nodeIntegration: true
		}
	});

	// and load the index.html of the app.
	mainWindow.loadFile('src/mainWindow.html');

	// Emitted when the window is closed.
	mainWindow.on('closed', () => {
		// Dereference the window object, usually you would store windows
		// in an array if your app supports multi windows, this is the time
		// when you should delete the corresponding element.
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
	// Load html into window¨
	addWindow.loadFile('src/addWindow.html');

	// Garbage collection handle
	addWindow.on('closed', function() {
		addWindow = null;
	});
}

function createEditWindow() {
	// Create new window
	editWindow = new BrowserWindow({
		webPreferences: {
			nodeIntegration: true
		},
		width: 500,
		height: 400,
		title: 'Edit Item'
	});
	// Load html into window¨
	editWindow.loadFile('src/editWindow.html');

	// Garbage collection handle
	editWindow.on('closed', function() {
		editWindow = null;
	});
}

// Catch item:add and store in /data/data.json
ipcMain.on('item:add', function(e, item) {
	let itemTags = `${store.get('tags')}, ${item.tag}`;
	//store item data
	store.set(item.tag, item);
	//store item tag
	store.set('tags', itemTags);

	updateTable();

	addWindow.close();
});

ipcMain.on('table:load', function(e) {
	updateTable();
});

ipcMain.on('addWindow:open', function(e) {
	createAddWindow();
});

ipcMain.on('editWindow:open', function(e) {
	createEditWindow();
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createMainWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
	// On macOS it is common for applications and their menu bar
	// to stay active until the user quits explicitly with Cmd + Q
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
				label: 'Add Item',
				click() {
					createAddWindow();
				}
			},
			{
				label: 'Edit Item',
				click() {}
			},
			{
				label: 'Delete Item',
				click() {}
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
				// Tjekker om det er mac eller pc og tilføjer keyboard shortcut
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
	const itemTags = tags.split(', ');

	// Update table for each tag
	for (let i = 0; i < itemTags.length; i++) {
		item = store.get(itemTags[i]);
		mainWindow.webContents.send('table:update', item);
	}
}
