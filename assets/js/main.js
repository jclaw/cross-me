$(document).ready(function() {
	var gameboard = $('#gameboard');
	var gameObject = {};

	$('#slider').slider({
		value: 50,
		min: 20,
		max: 80,
		orientation: 'horizontal',
		slide: function( event, ui ) {
        	$('#amount').text( ui.value + '%' );
      	}
	});
	$('#amount').text($('#slider').slider('value') + '%');

	$('#random_board').click(function() {

		$('#rboard_form').toggle();
	});

	$('#rboard_form [name="generate"]').click(function() {
		$('#content_selection').hide();
		
		var w = parseInt($('#rboard_form [name="width"]').val()),
			h = parseInt($('#rboard_form [name="height"]').val()),
			whitespace = $('#slider').slider('value');

		var data = generate_random_board(w, h, whitespace);
		
		console.log(data);
		build_data(data);

	});

	$('#premade').click(function() {
		$('#content_selection').hide();
		var jqxhr = $.getJSON("assets/json/levels/L2.json", function(d) {
			console.log("success");
			var data = d.board;
			console.log(data);
			build_data(data);
		});
	});

	function generate_random_board(width, height, whitespace) {
		console.log('width: ' + width + ' height: ' + height);
		var data,
			board = [];
		for (var r = 0; r < height; r++) {
			var temp = [];
			for (var c = 0; c < width; c++) {
				temp[c] = Math.random() * 100 > whitespace ? 1 : 0;
			}
			board[r] = temp;
		}
		console.log(board);

		data = {
			name: width + 'x' + height + ' random board',
			height: height,
			width: width
		};
		data.row_data = [];
		data.col_data = [];

		for (var r = 0; r < height; r++) {
			var sum = 0;
			var temp = [];
			for (var c = 0; c < width; c++) {
				if (board[r][c] == 1) {
					sum++;
				} else if (sum != 0) {
					temp.push(sum);
					sum = 0;
				}
			}
			if (sum != 0) temp.push(sum);
			if (temp.length == 0) temp.push(0);
			data.row_data[r] = temp;
		}

		for (var c = 0; c < width; c++) {
			var sum = 0;
			var temp = [];
			for (var r = 0; r < height; r++) {
				if (board[r][c] == 1) {
					sum++;
				} else if (sum != 0) {
					temp.push(sum);
					sum = 0;
				} 
			}
			if (sum != 0) temp.push(sum);
			if (temp.length == 0) temp.push(0);
			data.col_data[c] = temp;
		}
		print_board(board, width, height);

		return data;
	}

	function print_board(board, width, height) {
		var table = $('<table><tbody></tbody></table>'),
			tbody = table.find('tbody');
		table.css('border','1px');
		for (var r = 0; r < height; r++) {
			tbody.append('<tr>');
			for (var c = 0; c < width; c++) {
				var cls = board[r][c] == 1 ? 'active-cell': '';
				tbody.append('<td class="' + cls + '"</td>');
			}
			tbody.append('</tr>');
		}
		

		$('#site-content').prepend(table);
	}
	

	function build_data(data) {
		console.log('build_data');
		if (data.height == data.row_data.length && data.width == data.col_data.length) {
			gameObject['board_name'] = data.name;
			gameObject['height'] = data.height;
			gameObject['width'] = data.width;

			objecterate(data.row_data);
			objecterate(data.col_data);

			gameObject['row_data'] = data.row_data;
			gameObject['col_data'] = data.col_data;
			init_game(gameboard, gameObject);
			
		} else {
			alert("error! u suck");
		}
	}
	


	function init_game(gameboard, gameObject) {
		var boardComponents = {},
			dragObject = {};


		gameObject['array'] = [[]];
		draw_board(gameboard, gameObject);


		boardComponents['gameboard'] = gameboard;
		boardComponents['cells'] = gameboard.find('td.board-element');


		build_gamearray(gameboard, gameObject, boardComponents['cells']);

		boardComponents['cells'].on('click', function() {
			$(this).toggleClass('active-cell');
			check_completion(gameObject, $(this));
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
		    check_completion(gameObject, $(this));
		});


		boardComponents['cells'].on('dragenter', function(event) {

			var curr = {},
				curr_data;

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
			check_completion(gameObject, $(this));
		});

		boardComponents['cells'].on('dragend', function(event) {
			event = event.originalEvent || event;
			$(this).removeClass('dragstart');

			while (dragObject['stack'].length > 0) dragObject['stack'].pop();

			console.log('end');
			console.log(event.dataTransfer.dropEffect);
		});


		start_timer(gameObject);
		$('#game').show();
	}

	function draw_board(gameboard, gameObject) {
		var row_data = gameObject['row_data'],
			col_data = gameObject['col_data'];
		var num_extra_columns = max_length(row_data);
		var num_extra_rows = max_length(col_data);

		var tbody = gameboard.find('tbody');
		gameObject['origin'] = {row: num_extra_rows, col: num_extra_columns};

		var height = gameObject['height'],
			width = gameObject['width'];

		var border_mult = 5;
		for (var r = 0; r < height + num_extra_rows; r++) {
			
			tbody.append('<tr>');
			
			for (var c = 0; c < width + num_extra_columns; c++) {
				
				var true_r = r - num_extra_rows,
					true_c = c - num_extra_columns;
				if (true_r < 0 && true_c < 0) {
					// printing blanks in the upper left corner
					tbody.append($('<td></td>'));
				} else {
					var content = '<td class="';
					// create borders
					if (true_r >= 0 && true_r % border_mult == 0) content += ' border-top';
					if (true_c >= 0 && true_c % border_mult == 0) content += ' border-left';

					if (true_r >= 0 && true_c >= 0) {
						// make cells draggable and include their index in data tags
						content += ' board-element" ';
						content += 'draggable=true data-index="' + true_r + ',' + true_c + '">';
						var cell = $(content + '</td>');
						tbody.append(cell);
					} else if (true_r < 0 || true_c < 0) {
						// take care of displaying the game data along the top and left
						
						var index1, index2, lim, arr;
						
						if (true_r < 0) {		// column data along the top
							index1 = true_c;
							index2 = r;
							lim = num_extra_rows;
							arr = col_data;
						} else { 				// row data along the left
							index1 = true_r;
							index2 = c;
							lim = num_extra_columns;
							arr = row_data;
						}

						var length = arr[index1].length;
						
						if (length + index2 >= lim) {
							if (arr[index1][index2 - lim + length].val == 0) {
								content += ' complete';
							}
							content += ' data">';
							var elem = arr[index1][index2 - lim + length];
							var cell = $(content + elem.val + '</td>');
							tbody.append(cell);
							elem.cell = cell;
						} else {
							content += ' data">';
							tbody.append($(content + '</td>'));
						}
					} 
				}
				
				
			}
			tbody.append('</tr>');
		}
	}

	function start_timer() {
		var time_object = {
			timer: $('#timer'),
			seconds: 0,
			minutes: 0
		};
		run_timer(time_object);
	}

	function run_timer(time_object) {
		var timer = time_object.timer,
			seconds = time_object.seconds,
			minutes = time_object.minutes,
			t;
		t = setTimeout(function() {
			seconds++;
			if (seconds >= 60) {
				seconds = 0;
				minutes++;
			}
			timer.text((minutes ? (minutes > 9 ? minutes : "0" + minutes) : "00") + ":" + (seconds > 9 ? seconds : "0" + seconds));
			time_object.seconds = seconds;
			time_object.minutes = minutes;
			run_timer(time_object);
		}, 1000);
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

		if ( (direction == 'left' && curr.col < elem.col) || (direction == 'right' && curr.col > elem.col) ||
			 (direction == 'up' && curr.row < elem.row) || (direction == 'down' && curr.row > elem.row)       ) {
			// expanding
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
			if (direction == 'left' || direction == 'right') {
				r_off = 0;
				c_off = count * coef;
			} else {
				r_off = count * coef;
				c_off = 0;
			}

			var start_cell = { cell: cell, row: curr.row + r_off, col: curr.col + c_off };


			fill_stack(gameObject, dragObject, start_cell);


		} else if ( (direction == 'left' && curr.col > elem.col) || (direction == 'right' && curr.col < elem.col) ||
					(direction == 'up' && curr.row > elem.row) || (direction == 'down' && curr.row < elem.row)		) {
			// shrinking
			dragObject['stack'].pop();
			if (elem['cell'] != '' && task == 'on') elem['cell'].removeClass('active-cell');
			else if (elem['cell'] != '' && task == 'off') elem['cell'].addClass('active-cell');
		}

		console.log('real dragenter');
		
		dragObject['curr'] = curr; // TODO: do I need this?
	}

	function fill_stack(gameObject, dragObject, init) {
		var start = init,
			curr = dragObject['curr'],
			row_delta = curr['row'] - start['row'],
			col_delta = curr['col'] - start['col'],
			direction = dragObject['direction'],
			task = dragObject['task'];

		var coef, r_off, c_off, distance;
		distance = (direction == 'left' || direction == 'right') ? Math.abs(col_delta) : Math.abs(row_delta);

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

			if ( is_cell_to_retain(elem['cell'], task) ) { 
				elem['cell'] = ''; 
			}
			else { 
				elem['cell'].toggleClass('active-cell'); 
			}
			dragObject['stack'].push(elem);
		}
	}

	function check_completion(gameObject, cell) {
		var start_data = get_indices(cell),
			r = start_data[0],
			c = start_data[1];

		for (var n = 0; n < 1; n++) {

			var user_data = [],
				sum = 0;

			var index, arr_name, game_data;
			if (n == 0) {
				// define vars for row
				index = r;
				arr_name = 'row_data';
				game_data = gameObject['array'][r];
				
			} else if (n == 1) {
				// define vars for col
				index = c;
				arr_name = 'col_data';
				game_data = [];
				for (var i = 0; i < gameObject['height']; i++) {
					game_data.push(gameObject['array'][i][c]);
				}
			}

			for (var i = 0; i < game_data.length; i++) {
				if ($(game_data[i]).hasClass('active-cell')) {
					sum++;
				} else if (sum != 0) {
					user_data.push(sum);
					sum = 0;
				}
			}
			if (sum != 0) user_data.push(sum);

			compare_arrays(user_data, gameObject[arr_name][index]);

		}
	}


	function compare_arrays(arr1, data) {

		var data_vals = [];
		for (var i = 0; i < data.length; i++) {
			data_vals[i] = data[i].val;
		}
		if (arr1.length > data.length) {
			remove_all_complete(data);
		}
		else if (same_array(arr1, data_vals)) {
			for (var i = 0; i < data.length; i++) {
				data[i].cell.addClass('complete');
			}
		} else if (arr1.length == data.length) {
			for (var i = 0; i < arr1.length; i++) {
				if (arr1[i] == data[i].val) {
					data[i].cell.addClass('complete');
				} else {
					data[i].cell.removeClass('complete');
				}
			}
		} else {
			var index = 0;

			for (var i = 0; i < data.length; i++) {
				console.log('index: ' + index + ' arr1.length: ' + arr1.length);
				if (index < arr1.length) {
					if (data[i].val == arr1[index]) {
						data[i].cell.addClass('complete');
						index++;
					} else {
						data[i].cell.removeClass('complete');
					}
				} else if (index == arr1.length) {
					data[i].cell.removeClass('complete');
					index++;
				} else {
					console.log('removing all');
					remove_all_complete(data);
					break;
				}
			}
		}
	}

	function same_array(arr1, arr2) {
		if (arr1.length != arr2.length) return false;
		for (var i = 0; i < arr1.length; i++) {
			if (arr1[i] != arr2[i]) return false;
		}
		return true;
	}

	function remove_all_complete(data) {
		for (var i = 0; i < data.length; i++) {
			data[i].cell.removeClass('complete');
		}
	}

	function objecterate(arr) {
		for (var i = 0; i < arr.length; i++) {
			for (var j = 0; j < arr[i].length; j++) {
				arr[i][j] = {val: arr[i][j]};
			}
		}
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