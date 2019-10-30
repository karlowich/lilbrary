const electron = require('electron');
const { ipcRenderer } = electron;

const tbody = document.querySelector('tbody');

document.addEventListener('DOMContentLoaded', function() {
	// load data
	ipcRenderer.send('table:load');
});

// Update items
ipcRenderer.on('table:update', function(e, item) {
	const tr = document.createElement('tr');
	const composer = document.createElement('td');
	const title = document.createElement('td');
	const year = document.createElement('td');
	composer.className = 'composer';
	title.className = 'title';
	year.className = 'year';
	composer.append(item.composer);
	title.append(item.title);
	year.append(item.year);
	tr.appendChild(composer);
	tr.appendChild(title);
	tr.appendChild(year);
	tbody.append(tr);
	sortTable(0);
});

ipcRenderer.on('table:clear', function() {
	//clear tbody
	tbody.innerHTML = '';
});

function openAddWindow() {
	ipcRenderer.send('addWindow:open');
}

function openEditWindow() {
	let row = document.querySelector('.selected');
	let tag = `${row.querySelector('.composer').innerHTML} ${
		row.querySelector('.title').innerHTML
	}`;
	ipcRenderer.send('editWindow:open', tag);
}

//from w3school
function sortTable(n) {
	let table, rows, switching, i, x, y, shouldSwitch, dir;
	let switchcount = 0;
	table = document.getElementById('mainTable');
	switching = true;
	// Set the sorting direction to ascending:
	dir = 'asc';
	/* Make a loop that will continue until
  no switching has been done: */
	while (switching) {
		// Start by saying: no switching is done:
		switching = false;
		rows = table.rows;
		/* Loop through all table rows (except the
    first, which contains table headers): */
		for (i = 1; i < rows.length - 1; i++) {
			// Start by saying there should be no switching:
			shouldSwitch = false;
			/* Get the two elements you want to compare,
      one from current row and one from the next: */
			x = rows[i].getElementsByTagName('td')[n];
			y = rows[i + 1].getElementsByTagName('td')[n];
			/* Check if the two rows should switch place,
      based on the direction, asc or desc: */
			if (dir == 'asc') {
				if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
					// If so, mark as a switch and break the loop:
					shouldSwitch = true;
					break;
				}
			} else if (dir == 'desc') {
				if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
					// If so, mark as a switch and break the loop:
					shouldSwitch = true;
					break;
				}
			}
		}
		if (shouldSwitch) {
			/* If a switch has been marked, make the switch
      and mark that a switch has been done: */
			rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
			switching = true;
			// Each time a switch is done, increase this count by 1:
			switchcount++;
		} else {
			/* If no switching has been done AND the direction is "asc",
      set the direction to "desc" and run the while loop again. */
			if (switchcount == 0 && dir == 'asc') {
				dir = 'desc';
				switching = true;
			}
		}
	}
}

//from w3school modified
function searchTable() {
	// Declare variables
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
