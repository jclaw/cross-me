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

			dragObject['start']['cell'].addClass('active-cell');
			dragObject['stack'].push(dragObject['start']);
			
			console.log('start');
			//dragObject['stack'].push({cell: $(this), row: Number(start_data[0]), col: Number(start_data[1]) } );


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
				update_cell(gameObject, dragObject);



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


	function update_direction(gameObject, dragObject) {
		var start = dragObject['start'],
			curr = dragObject['curr'],
			row_delta = curr['row'] - start['row'],
			col_delta = curr['col'] - start['col'],
			direction = dragObject['direction'];


		if (Math.abs(col_delta) > Math.abs(row_delta)) {
			if (col_delta < 0) direction = 'left';
			else if (col_delta > 0) direction = 'right';
		} else if (Math.abs(col_delta) < Math.abs(row_delta)) {
			if (row_delta < 0) direction = 'up';
			else if (row_delta > 0) direction = 'down';
		}


		if (dragObject['direction'] != 'none' && dragObject['direction'] != direction) {
			// change direction
			while (dragObject['stack'].length > 1) {
				var elem = dragObject['stack'].pop();
				if (elem['cell'] != '') elem['cell'].removeClass('active-cell');
			}
			var coef, r_off, c_off, distance;
			distance = (direction == 'left' || direction == 'right') ? Math.abs(col_delta) : Math.abs(row_delta);

			for (var i = 1; i < distance; i++) {
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
				dragObject['stack'].push(elem);
				elem['cell'].addClass('active-cell');
			}
			
		}
		dragObject['direction'] = direction;
	}

	function update_cell(gameObject, dragObject) {
		var direction = dragObject['direction'],
			class_name = 'active-cell',
			state = 'stable';

		var curr = dragObject['curr'];
		var elem = dragObject['stack'].pop();
		dragObject['stack'].push(elem);

		// console.log('direction: ' + direction);

		
		if ( (direction == 'left' && curr.col < elem.col) || (direction == 'right' && curr.col > elem.col) ) {
			curr['row'] = dragObject['start']['row'];
			curr['cell'] = $(gameObject['array'][curr.row][curr.col]);
			state = 'expanding';
		} else if ( (direction == 'up' && curr.row < elem.row) || (direction == 'down' && curr.row > elem.row) ) {
			curr['col'] = dragObject['start']['col'];
			curr['cell'] = $(gameObject['array'][curr.row][curr.col]);
			state = 'expanding';
		} else if ( (direction == 'left' && curr.col > elem.col) || (direction == 'right' && curr.col < elem.col) ||
					(direction == 'up' && curr.row > elem.row) || (direction == 'down' && curr.row < elem.row)		) {
			state = 'shrinking';
		}

		// console.log('state: ' + state);
		if (state == 'expanding') {
			if (curr['cell'].hasClass(class_name)) curr['cell'] = '';
			else curr['cell'].addClass(class_name);
			dragObject['stack'].push(curr);
		} else if (state == 'shrinking') {
			dragObject['stack'].pop();
			if (elem['cell'] != '') elem['cell'].removeClass(class_name);
		}
		// pop cell off top of stack
		// if left,
			// if cell.col < curr.col, push cell back on.
				// if curr.hasClass('active-cell'), push obj with no cell field
				// else push new cell (start.row, curr.col)
			// else if cell.col > curr.col, toggle cell
		

		console.log('real dragenter');
		
		dragObject['curr'] = curr; // TODO: do I need this?
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