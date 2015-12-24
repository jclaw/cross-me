$(document).ready(function() {
	var gameboard = $('#gameboard');
	var gameObject = {};

	var jqxhr = $.getJSON("assets/json/image_alt.json", function(d) {
			console.log("success");
			var data = d.board;

			if (data.height == data.row_data.length && data.width == data.col_data.length) {
				gameObject['board_name'] = data.name;
				gameObject['height'] = data.height;
				gameObject['width'] = data.width;
				gameObject['row_data'] = data.row_data;
				gameObject['col_data'] = data.col_data;
				init_game(gameboard, gameObject);
				
			} else {
				alert("error! u suck");
			}
		});


	function init_game(gameboard, gameObject) {
		var boardComponents = {},
			dragObject = {};

		// gameObject['width'] = 30;
		// gameObject['height'] = 16;
		gameObject['array'] = [[]];
		draw_board(gameboard, gameObject);


		boardComponents['gameboard'] = gameboard;
		boardComponents['cells'] = gameboard.find('td.data');
		// console.log(boardComponents['cells']);

		build_gamearray(gameboard, gameObject, boardComponents['cells']);

		boardComponents['cells'].on('click', function() {
			$(this).toggleClass('active-cell');
		});
		
		boardComponents['cells'].on('change', function(event) {
			console.log('change');
		});

		boardComponents['cells'].on('mouseover', function(event) {
			// console.log('over');
			
			// $(this).addClass('mouseover');
				
		});


		boardComponents['cells'].on('mouseout', function(event) {
			// $(this).removeClass('mouseover');
			//console.log('out');
		});


		boardComponents['cells'].on('dragstart', function(event) {


			$(this).addClass('dragstart');
			dragObject['start'] = {};
			dragObject['curr'] = {};
			dragObject['start']['cell'] = $(this);
			dragObject['direction'] = 'none';
			// dragObject['distance'] = 0;
			dragObject['stack'] = [];



			var start_data = get_indices(dragObject['start']['cell']);
			dragObject['start']['row'] = start_data[0];
			dragObject['start']['col'] = start_data[1];
			dragObject['curr']['row'] = dragObject['start']['row'];
			dragObject['curr']['col'] = dragObject['start']['col'];


			if ($(this).hasClass('active-cell')) {
				dragObject['start']['cell'].removeClass('active-cell');
				dragObject['task'] = 'off';
			} else {
				dragObject['start']['cell'].addClass('active-cell');
				dragObject['task'] = 'on';
			}
			
			dragObject['stack'].push(dragObject['start']);
			
			console.log('start');

			// hide ghost image
		    var crt = $(this).clone();
		    crt.removeClass();
		    crt.css('visibility', 'hidden');
		    crt.css('height', '20px');
		    crt.css('width', '20px');
		    $('body').append(crt);
		    crt = crt.get(0);
		    event.originalEvent.dataTransfer.setDragImage(crt, 0, 0);

		});


		boardComponents['cells'].on('dragenter', function(event) {

			var curr = {},
				curr_data;
			// console.log('dragenter');


			curr['cell'] = $(this);
			curr_data = get_indices(curr['cell']);
				
			curr['row'] = curr_data[0];
			curr['col'] = curr_data[1];
			dragObject['curr'] = curr;

			var elem = dragObject['stack'].pop();
			dragObject['stack'].push(elem);
			if (curr['row'] != elem['row'] || curr['col'] != elem['col']) {

				update_direction(gameObject, dragObject);
				update_cells(gameObject, dragObject);

			}
		});

		boardComponents['cells'].on('dragend', function(event) {
			event = event.originalEvent || event;
			$(this).removeClass('dragstart');

			while (dragObject['stack'].length > 0) dragObject['stack'].pop();

			console.log('end');
			console.log(event.dataTransfer.dropEffect);
		});
	}

	function draw_board(gameboard, gameObject) {
		var row_data = gameObject['row_data'],
			col_data = gameObject['col_data'];
		var num_extra_columns = max_length(row_data);
		var num_extra_rows = max_length(col_data);
		gameObject['origin'] = {row: num_extra_rows, col: num_extra_columns};
		// find maximum sized array for row data
		// populate max size elements in each row, inserting data left aligned

		var height = gameObject['height'],
			width = gameObject['width'];

		var content = '';
		for (var r = 0; r < height + num_extra_rows; r++) {
			
			content += '<tr>';
			
			for (var c = 0; c < width + num_extra_columns; c++) {
				// make cells draggable and include their index in data tags
				var true_r = r - num_extra_rows,
					true_c = c - num_extra_columns;
				if (true_r < 0 && true_c < 0) {
					// printing blanks in the upper left corner
					content += '<td></td>';
				} else if (true_r < 0) {	
					var length = col_data[true_c].length;
					if (length + r < num_extra_columns) {
						content += '<td></td>';
					} else {
						content += '<td>' + col_data[true_c][r - num_extra_columns + length] + '</td>';
					}
				} else if (true_c < 0) {
					var length = row_data[true_r].length;
					if (length + c < num_extra_rows) {
						content += '<td></td>';
					} else {
						content += '<td>' + row_data[true_r][c - num_extra_rows + length] + '</td>';
					}
				} else {
					content += '<td draggable=true class="data" data-index="' + true_r + ',' + true_c + '"></td>';
				}
				
			}
			content += '</tr>';
		}
		gameboard.append(content);
	}

	function max_length(array2D) {
		var max = 0;
		for (var i = 0; i < array2D.length; i++) {
			if (array2D[i].length > max) max = array2D[i].length;
		}
		return max;
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

	function update_direction(gameObject, dragObject) {

		var row_delta = dragObject['curr']['row'] - dragObject['start']['row'],
			col_delta = dragObject['curr']['col'] - dragObject['start']['col'],
			direction = dragObject['direction'],
			task = dragObject['task'];


		if (Math.abs(col_delta) > Math.abs(row_delta)) {
			if (col_delta < 0) direction = 'left';
			else if (col_delta > 0) direction = 'right';
		} else if (Math.abs(col_delta) < Math.abs(row_delta)) {
			if (row_delta < 0) direction = 'up';
			else if (row_delta > 0) direction = 'down';
		}


		if (dragObject['direction'] != 'none' && dragObject['direction'] != direction) {
			// change direction
			console.log('change_direction');
			while (dragObject['stack'].length > 1) {
				var elem = dragObject['stack'].pop();
				if (elem['cell'] != '' && task == 'on') elem['cell'].removeClass('active-cell');
				else if (elem['cell'] != '' && task == 'off') elem['cell'].addClass('active-cell');
			}
			dragObject['direction'] = direction;
			fill_stack(gameObject, dragObject, dragObject['start']);

			
		} else {
			dragObject['direction'] = direction;
		}
	}

	function update_cells(gameObject, dragObject) {
		var direction = dragObject['direction'],
			task = dragObject['task'],
			class_name = 'active-cell',
			state = 'stable';


		var curr = dragObject['curr'];
		var elem = dragObject['stack'].pop();
		dragObject['stack'].push(elem);


		// debug_print_array(dragObject['stack'], 'stack');
		// console.log(curr);
		// console.log(elem);
		if ( (direction == 'left' && curr.col < elem.col) || (direction == 'right' && curr.col > elem.col) ||
			 (direction == 'up' && curr.row < elem.row) || (direction == 'down' && curr.row > elem.row)       ) {
			// expanding
			// console.log('expanding');
			var coef, r_off, c_off, distance;
			

			if (direction == 'left' || direction == 'right') {
				curr['row'] = dragObject['start']['row'];
				coef = (direction == 'left') ? 1 : -1;
			} else {
				curr['col'] = dragObject['start']['col'];
				coef = (direction == 'up') ? 1 : -1;
			}
			
			var debug_count = 0;
			var count = 1;
			while (true) {
				if (debug_count > 50) {console.log('ERROR'); break;}
				if (direction == 'left' || direction == 'right') {
					r_off = 0;
					c_off = count * coef;
				} else {
					r_off = count * coef;
					c_off = 0;
				}
				var cell = $(gameObject['array'][curr.row + r_off][curr.col + c_off]);
				if (dragObject['stack'])
				var top_stack = dragObject['stack'][dragObject['stack'].length - 1];

				if ( is_cell_to_retain(cell, task) && top_stack['cell'] == '') {
					dragObject['stack'].pop();
				} else if ( is_cell_to_retain(cell, task) ) {
					break;
				} 
				count++;
				debug_count++;
				console.log('catching up');
				
			}
			// count--;
			if (direction == 'left' || direction == 'right') {
				r_off = 0;
				c_off = count * coef;
			} else {
				r_off = count * coef;
				c_off = 0;
			}
			// console.log('count: ' + count);

			var start_cell = { cell: cell, row: curr.row + r_off, col: curr.col + c_off };


			fill_stack(gameObject, dragObject, start_cell);


		} else if ( (direction == 'left' && curr.col > elem.col) || (direction == 'right' && curr.col < elem.col) ||
					(direction == 'up' && curr.row > elem.row) || (direction == 'down' && curr.row < elem.row)		) {
			// shrinking
			// console.log('shrinking');
			dragObject['stack'].pop();
			if (elem['cell'] != '' && task == 'on') elem['cell'].removeClass('active-cell');
			else if (elem['cell'] != '' && task == 'off') elem['cell'].addClass('active-cell');
		}
		// debug_print_array(dragObject['stack'], 'stack');
		console.log('real dragenter');
		
		dragObject['curr'] = curr; // TODO: do I need this?
	}

	function fill_stack(gameObject, dragObject, init) {
		// console.log('fill_stack');
		// debug_print_array(dragObject['stack'], 'stack');
		var start = init,
			curr = dragObject['curr'],
			row_delta = curr['row'] - start['row'],
			col_delta = curr['col'] - start['col'],
			direction = dragObject['direction'],
			task = dragObject['task'];
		// console.log('start:');
		// console.log(start);
		// console.log('curr:');
		// console.log(curr);
		var coef, r_off, c_off, distance;
		distance = (direction == 'left' || direction == 'right') ? Math.abs(col_delta) : Math.abs(row_delta);

		// console.log('distance: ' + distance);
		for (var i = 1; i <= distance; i++) {
			var elem = {};
			if (direction == 'left' || direction == 'right') {
				coef = (direction == 'left') ? -1 : 1;
				r_off = 0;
				c_off = i * coef;
			} else if (direction == 'up' || direction == 'down') {
				coef = (direction == 'up') ? -1 : 1;
				r_off = i * coef;
				c_off = 0;
			}
			elem['cell'] = $(gameObject['array'][start.row + r_off][start.col + c_off]);
			elem.row = start.row + r_off;
			elem.col = start.col + c_off;
			// dragObject['stack'].push(elem);
			// elem['cell'].addClass('active-cell');


			if ( is_cell_to_retain(elem['cell'], task) ) { 
				elem['cell'] = ''; 
			}
			else { 

				// this might not work
				elem['cell'].toggleClass('active-cell'); 
			}
			dragObject['stack'].push(elem);
		}
		// debug_print_array(dragObject['stack'], 'stack');
	}

	function is_cell_to_retain(cell, task) {
		return (task == 'on' && cell.hasClass('active-cell')) || (task == 'off' && !cell.hasClass('active-cell'));
	}

	function debug_print_array(array, name) {
		console.log(name.toUpperCase());
		for (var i = 0; i < array.length; i++) { console.log(array[i]); }
		console.log('END ' + name.toUpperCase());
	}

	function get_indices(cell) { 
		var arr = $(cell).data('index').split(',');
		for (var i = 0; i < arr.length; i++) { arr[i] = +arr[i]; }
		return arr;
	}

	function sign(x) { return x > 0 ? 1 : x < 0 ? -1 : 0; }

});