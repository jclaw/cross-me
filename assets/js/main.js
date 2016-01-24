$(function() {
	var gameboard = $('#gameboard');
	var gameObject = {};
	var timer;
	var levels = [],
		num_levels = 12;
	// create_levels(num_levels);

	var slider_min = 20,
		slider_max = 80;

	initialize();
	$(window).trigger('hashchange');
	//debug_log_data('11');

	

	$(window).on('hashchange', function(e){
		// On every hash change the render function is called with the new hash.
		// This is how the navigation of our app happens.

		render(window.location.hash);

	});

	function initialize() {
		for (var i = 0; i < num_levels; i++) { levels.push(''); }
		render(window.location.hash);
	}

	function render(url) {
		// This function decides what type of page to show 
		// depending on the current url hash value.
		var temp = url.split('/')[0];
		

		$('.main-content .page').removeClass('visible');
		var map = {

			// The Homepage.
			'': function() {
				levels = [];
				create_levels(num_levels);

				// TODO: reset game here
				$('.start-screen .btn-wrap').removeClass('open').find('.active').removeClass('active');
				// reset timer
				clearTimeout(timer);
				$('#timer').text('00:00');


				// Clear the filters object, uncheck all checkboxes, show all the products
				// filters = {};
				// checkboxes.prop('checked',false);
				renderStartScreen();
			},

			// Game page.
			'#game': function() {
				// Establish whether the game is a level or random
				var hash = url.split('#game/')[1].trim(),
					data = hash.split('/'),
					type = data[0].trim();
				if (type && type == 'random' && data.length == 4) {
					try { mapRandom(data); } 
					catch (err) { alert(err); }
					
				} else if (type && type == 'level' && data.length == 2) {
					try { mapLevel(data); }
					catch (err) { alert(err); }
				} else {
					// go to error page
					alert('error');
				}
				

			}
		};

		// Execute the needed function depending on the url keyword (stored in temp).
		if(map[temp]){
			map[temp]();
		}
		// If the keyword isn't listed in the above - render the error page.
		else {
			renderErrorPage();
		}

	}

	function mapRandom(data) {
		// sanitize data
		for (var i = 1; i < data.length; i++) {
			data[i] = parseInt(data[i]);
			if (data[i] == NaN) throw 'Please input numbers only.';
		};

		var max_width = 50,
			max_height = 30;
		
		if (data[1] > max_width || data[1] <= 0) {
			throw 'Please input a width less than ' + max_width + ' and greater than 0.';
		}
		if (data[2] > max_height || data[2] <= 0) {
			throw 'Please input a height less than ' + max_height + ' and greater than 0.';
		}
		if (data[3] > slider_max || data[3] < slider_min) {
			throw 'Please input a whitespace value less than ' + slider_max + ' and greater than ' + slider_min + '.';
		}
		setHeader('.game-screen', 'Random Board');

		// make request
		var reqdata = {
			width: data[1],
			height: data[2],
			whitespace: data[3]
		};

		var jqxhr = $.get( 'http://nonograms-server.herokuapp.com/random-board/', reqdata, function(d) {
			prep_data(d);
			renderGame(d);
		});
		
	}

	function mapLevel(data) {
		// sanitize data
		data[1] = parseInt(data[1]);
		if (data[1] == NaN) throw 'Please input numbers only.';

		if (data[1] > num_levels || data[1] <= 0) {
			throw data[1] + ' is not a valid level';
		}
		var index = data[1] - 1;
		
		if (levels[index] == '') {
			var jqxhr = $.get( 'http://nonograms-server.herokuapp.com/level', {index: index}, function(d) {

				levels[index] = d;
				prep_data(d);
				setHeader('.game-screen', 'Level ' + (index + 1) + ': ' + d.name);
				renderGame(d);
			});
		} else {
			setHeader('.game-screen', 'Level ' + (index + 1) + ': ' + levels[index].name);
			renderGame(levels[index]);
		}
		
	}

	function renderStartScreen() {
		// Hides other pages and shows the starting screen.
		$('.page').removeClass('visible');
		$('.start-screen').addClass('visible');
	}

	function renderGame(data) {
		// Hides other pages and shows the game with appropriate data.
		build_data(data);
		reset_timer();

		$('.page').not($('.game-screen')).removeClass('visible');
		$('.game-screen').addClass('visible');
	}

	function setHeader(page, string, sub1) {
		var header = $(page).find('.header');
		header.html('<h1>' + string + '</h1>');
		if (sub1) header.append('<h2>' + sub1 + '</h2>');
	}

	
	function create_levels(num_levels) {

		var jqxhr = $.get( 'http://nonograms-server.herokuapp.com/levels', function(data) {
			for (var i = 0; i < data.length; i++) {
				prep_data(data[i]);
			}
			levels = data;
			$('#levels').html('');
			for (var i = 0; i < data.length; i++) {
				var li = $('<li><a class="btn btn-inv-tertiary btn-square" data-index="' + i + '">' + data[i].name + '</a></li>');
				li.find('.btn').click(function(e) {
					e.preventDefault();

					var index = $(this).data('index');
					window.location.hash = 'game/level/' + (index + 1);
					
				});
				$('#levels').append(li);
			}
		});

	}

	function prep_data(data) {
		objecterate(data.row_data);
		objecterate(data.col_data);
	}

	function objecterate(arr) {
		for (var i = 0; i < arr.length; i++) {
			for (var j = 0; j < arr[i].length; j++) {
				arr[i][j] = {val: arr[i][j]};
			}
		}
	}

	function reset_timer() {
		clearTimeout(timer);
		$('#timer').text('00:00');
		start_timer();
	}

	function renderErrorPage(){
	    var page = $('.error');
	    page.addClass('visible');
  	}
  	

	$('#slider').slider({
		value: 50,
		min: slider_min,
		max: slider_max,
		range: 'min',
		orientation: 'horizontal',
		slide: function( event, ui ) {
        	$('#amount').text( ui.value + '%' );
      	}
	});
	$('#amount').text($('#slider').slider('value') + '%');

	$('.btn-wrap > .btn').click(function() {
		$(this).toggleClass('active');
		$('.btn').not(this).removeClass('active');
		var parent = $(this).parent();
		parent.toggleClass('open');
		$('.btn-wrap').not(parent).removeClass('open');
	});

	$('#rboard_form [name="generate"]').click(function() {
		// $('#content_selection').hide();

		var w = parseInt($('#rboard_form [name="width"]').val()),
			h = parseInt($('#rboard_form [name="height"]').val()),
			whitespace = $('#slider').slider('value');

		if (w == NaN || h == NaN || w <= 0 || h <= 0) {
			error('Please input a height and width and are greater than zero.');
		} else {
			window.location.hash = 'game/random/' + w + '/' + h + '/' + whitespace;

		}

	});


	function debug_log_data(string) {
		console.log(string);
		var jqxhr = $.getJSON('assets/json/solutions/S'+ string + '.json', function(d) {
			console.log("success");
			var data = d.board;
			var new_data = {};
			new_data.name = data.name;
			new_data.height = data.height;
			new_data.width = data.width;
			new_data.row_data = [];
			new_data.col_data = [];

			generate_data(new_data.row_data, data.solution, data.height, data.width, 'row');
			generate_data(new_data.col_data, data.solution, data.height, data.width, 'col');
			
			console.log('level ' + string);
			var d = {board: new_data};
			console.log(JSON.stringify(d, null, '\t'));
		});
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
		if (data.height == data.row_data.length && data.width == data.col_data.length) {
			gameObject['board_name'] = data.name;
			gameObject['height'] = data.height;
			gameObject['width'] = data.width;
			gameObject['row_data'] = data.row_data;
			gameObject['col_data'] = data.col_data;
			init_game(gameboard, gameObject);
			
		} else {
			alert("error! I suck");
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

		});

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
		tbody.html('');
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
						// make cells draggable and include their index
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

		var width_str = gameboard.find('td').css('width'),
			td_width = +width_str.slice(0, -2);
		gameboard.css('margin-left', -1 * num_extra_columns * td_width + 'px');
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
		var timerObj = time_object.timer,
			seconds = time_object.seconds,
			minutes = time_object.minutes;
		timer = setTimeout(function() {
			seconds++;
			if (seconds >= 60) {
				seconds = 0;
				minutes++;
			}
			timerObj.text((minutes ? (minutes > 9 ? minutes : "0" + minutes) : "00") + ":" + (seconds > 9 ? seconds : "0" + seconds));
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

			// catch up on missed dragenter events
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
				var top_stack = dragObject['stack'][dragObject['stack'].length - 1];

				if ( is_cell_to_retain(cell, task) && top_stack['cell'] == '') {
					dragObject['stack'].pop();
				} else if ( is_cell_to_retain(cell, task) ) {
					break;
				} 
				count++;
				debug_count++;
				
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

		for (var n = 0; n < 2; n++) {

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

			var finished = true;
			$('#gameboard .data').each(function() {
				if ($(this).text() != '' && !$(this).hasClass('complete')) finished = false;
			});

			if (finished) {
				// check solution
				console.log('check solution');
			}
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
		for (var i = 0; i < arr.length; i++) { arr[i] = +arr[i]; } // to number
		return arr;
	}

	function toTitleCase(str) {
	    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
	}

	function sign(x) { return x > 0 ? 1 : x < 0 ? -1 : 0; }

});