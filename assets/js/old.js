$(document).ready(function() {
	var gameboard = $('#gameboard');
	init_game(gameboard);


	function init_game(gameboard) {
		var boardComponents = {},
			gameObject = {},
			dragObject = {};

		gameObject['width'] = 10;
		gameObject['height'] = 11;
		gameObject['array'] = [[]];
		build_gameboard(gameboard, gameObject);


		boardComponents['gameboard'] = gameboard;
		boardComponents['cells'] = gameboard.find('td');

		build_gamearray(gameboard, gameObject, boardComponents['cells']);

		boardComponents['cells'].on('click', function() {
			$(this).toggleClass('active-cell');
		});
		
		boardComponents['cells'].on('change', function(event) {
			console.log('change');
		});

		boardComponents['cells'].on('mouseover', function(event) {
			//console.log('over');
			
			$(this).addClass('mouseover');
				
		});


		boardComponents['cells'].on('mouseout', function(event) {
			$(this).removeClass('mouseover');
			//console.log('out');
		});


		boardComponents['cells'].on('dragstart', function(event) {
			console.log($(this).toggleClass('active-cell'));


			$(this).addClass('dragstart');
			dragObject['start'] = {};
			dragObject['curr'] = {};
			dragObject['start']['cell'] = $(this);
			dragObject['direction'] = 'none';
			dragObject['distance'] = 0;


			var start_data = dragObject['start']['cell'].data('index').split(',');
			dragObject['start']['row'] = Number(start_data[0]);
			dragObject['start']['col'] = Number(start_data[1]);
			dragObject['curr']['row'] = dragObject['start']['row'];
			dragObject['curr']['col'] = dragObject['start']['col'];
			console.log('start');
		});

		boardComponents['cells'].on('dragenter', function(event) {
			var curr = {},
				curr_data;
			console.log('dragenter');

			curr['cell'] = $(this);
		
			curr_data = curr['cell'].data('index').split(',');
				
			curr['row'] = Number(curr_data[0]);
			curr['col'] = Number(curr_data[1]);

			if (curr['row'] != dragObject['curr']['row'] || curr['col'] != dragObject['curr']['col']) {
				// TODO: decide whether to activate or deactivate: the line could be expanding or shrinking



				console.log('real dragenter');
				dragObject['curr'] = curr;
				activate_cells(gameObject, dragObject);
			}
		});

		boardComponents['cells'].on('dragend', function(event) {
			event = event.originalEvent || event;
			$(this).removeClass('dragstart');
			console.log('end');
			console.log(event.dataTransfer.dropEffect);
		});
	}

	function build_gameboard(gameboard, gameObject) {
		var height = gameObject['height'],
			width = gameObject['width'],
			content = '';
		for (var r = 0; r < height; r++) {
			content += '<tr data-row="' + r + '">';
			for (var c = 0; c < width; c++) {
				// make cells draggable and include their index in data tags
				content += '<td draggable=true data-index="' + r + ',' + c + '"></td>';
			}
			content += '</tr>';
		}
		gameboard.append(content);

	}

	function build_gamearray(gameboard, gameObject, cells) {
		var array1D = cells.get(),
			height = gameObject['height'],
			width = gameObject['width'];

		for (var r = 0; r < height; r++) {
			var temp = [];
			for (var c = 0; c < width; c++) {
				temp[c] = array1D[r * width + c];
			}
			gameObject['array'][r] = temp;
		}
		
		// for (var r = 0; r < height; r++) {
		// 	for (var c = 0; c < width; c++) {
		// 		console.log($(gameObject['array'][r][c]).data('index'));
		// 	}
		// }
	}

	function activate_cells(gameObject, dragObject) {

			// console.log("row: " + curr.row + "  col: " + curr.col);

		find_direction(gameObject, dragObject);


		update_cells(gameObject, dragObject);
	}

	function find_direction(gameObject, dragObject) {

		var row_delta = dragObject['curr']['row'] - dragObject['start']['row'];
		var col_delta = dragObject['curr']['col'] - dragObject['start']['col'];
		var direction = 'none',
			distance = dragObject['distance'];

		if (Math.abs(col_delta) > Math.abs(row_delta)) {
			distance = Math.abs(col_delta);
			if (col_delta < 0) direction = 'left';
			else if (col_delta > 0) direction = 'right';
		} else if (Math.abs(col_delta) < Math.abs(row_delta)) {
			distance = Math.abs(row_delta);
			if (row_delta < 0) direction = 'up';
			else if (row_delta > 0) direction = 'down';
		}

		if (dragObject['direction'] != 'none' && dragObject['direction'] != direction) {
			console.log('changed direction!');
			restore_cells(gameObject, dragObject);
		}

		dragObject['distance'] = distance;
		dragObject['direction'] = direction;
	}

	function restore_cells(gameObject, dragObject) {
		var height = gameObject['height'],
			width = gameObject['width'],
			array = gameObject['array'],
			start_row = dragObject['start']['row'],
			start_col = dragObject['start']['col'],
			curr_row = dragObject['curr']['row'],
			curr_col = dragObject['curr']['col'],
			direction = dragObject['direction'],
			distance = dragObject['distance'];


		// if (direction == 'left') {
		// 	c_init = curr_col;
		// 	c_lim = start_col;
		// 	r_init = start_row;
		// 	r_lim = start_row + 1; // only run row loop once
		// 	coef = 1;
		// } else if (direction == 'right') {
		// 	c_init = start_col - curr_col;
		// 	c_lim = start_col;
		// 	r_init = start_row;
		// 	r_lim = start_row + 1; // only run row loop once
		// 	coef = -1;
		// }

		// var r_coef = sign(r_lim - r_init),
		// 	c_coef = sign(c_lim - c_init);

		// for (var r = r_init; r < r_lim; r += 1 * r_coef) {
		// 	for (var c = c_init; c < c_lim; c += 1 * c_coef) {
		// 		$(array[r][c]).toggleClass('active-cell');
		// 	}
		// }

		if (direction == 'left') {
			for (var c = start_col - distance; c < start_col; c++) {
				$(array[start_row][c]).toggleClass('active-cell');
			}
		} else if (direction == 'right') {
			for (var c = start_col + distance; c > start_col; c--) {
				$(array[start_row][c]).toggleClass('active-cell');
			}
		} else if (direction == 'up') {
			for (var r = start_row - distance; c < start_row; c++) {
				$(array[r][start_col]).toggleClass('active-cell');
			}
		} else if (direction == 'down') {
			for (var r = start_row + distance; c > start_row; c--) {
				$(array[r][start_col]).toggleClass('active-cell');
			}
		}

	}

	function update_cells(gameObject, dragObject) {
		var height = gameObject['height'],
			width = gameObject['width'],
			array = gameObject['array'],
			row = dragObject['start']['row'],
			col = dragObject['start']['col'],
			direction = dragObject['direction'],
			distance = dragObject['distance'];

		// if (direction == 'left') {
		// 	for (var c = start_col; c > start_col - distance; c--) {
		// 		$(array[start_row][c]).toggleClass('active-cell');
		// 	}
		// } else if (direction == 'right') {
		// 	for (var c = start_col; c < start_col + distance; c++) {
		// 		$(array[start_row][c]).toggleClass('active-cell');
		// 	}
		// } else if (direction == 'up') {
		// 	for (var r = start_row; r > start_row - distance; r--) {
		// 		$(array[r][start_col]).toggleClass('active-cell');
		// 	}
		// } else if (direction == 'dowm') {
		// 	for (var r = start_row; r < start_row + distance; r++) {
		// 		$(array[r][start_col]).toggleClass('active-cell');
		// 	}
		// }

		if (direction == 'left' && col - 1 >= 0) {
			$(array[row][col - distance]).addClass('active-cell');
		}
		else if (direction == 'right' && col + 1 < width) {
			$(array[row][col + distance]).addClass('active-cell');
		}
		else if (direction == 'up' && row - 1 >= 0) {
			$(array[row - distance][col]).addClass('active-cell');
		}
		else if (direction == 'down' && row + 1 < height) {
			$(array[row + distance][col]).addClass('active-cell');
		}

	}

	function sign(x) { return x > 0 ? 1 : x < 0 ? -1 : 0; }

});