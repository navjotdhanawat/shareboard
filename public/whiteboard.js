document.addEventListener('DOMContentLoaded', function () {

	var hideShowSharedBoard = document.getElementById('hide-show-btn');
	hideShowSharedBoard.addEventListener('click', function () {
		if ($('#' + event.currentTarget.id).hasClass('fa-arrow-right')) {
			$('canvas, #wb-section').animate({ 'marginLeft': '0px', opacity: 1 }, 1000);
			$("#hide-show-btn").addClass("fa-arrow-left");
			$("#hide-show-btn").removeClass("fa-arrow-right");
		} else {
			$('canvas, #wb-section').animate({ 'marginLeft': '-620px', opacity: 1 }, 1000);
			$("#hide-show-btn").addClass("fa-arrow-right");
			$("#hide-show-btn").removeClass("fa-arrow-left");
		}

	});

	function cUndo(cPushArray) {
		console.log('Undo---------');
		var canvasPic = new Image();
		canvasPic.src = cPushArray;
		canvasPic.onload = function () {
			context.clearRect(0, 0, canvas.width, canvas.height)
			context.drawImage(canvasPic, 0, 0);
		}
	}

	function cRedo(cPushArray) {

		console.log('Redo--------');
		var canvasPic = new Image();
		canvasPic.src = cPushArray;
		canvasPic.onload = function () {
			context.clearRect(0, 0, canvas.width, canvas.height)
			context.drawImage(canvasPic, 0, 0);
		}
	}

	var shareBoard = new io.connect('/shareBoard');
	shareBoard.on('shareBoard points', function (points) {
		painting(points);
	});
	shareBoard.json.emit('shareBoard refresh', {});
	shareBoard.on('shareBoard savedImg', function (data) {
		console.log('SavedImg.....');
		var savedImg = data.savedImg;
		if (savedImg) {
			var canvasPic = new Image();
			canvasPic.src = savedImg;
			canvasPic.onload = function () {
				context.clearRect(0, 0, canvas.width, canvas.height)
				context.drawImage(canvasPic, 0, 0);
			}
		} else {
			context.clearRect(0, 0, canvas.width, canvas.height)
		}
	});

	shareBoard.on('shareBoard clear', function (data) {
		context.clearRect(0, 0, canvas.width, canvas.height)
	});

	shareBoard.on('shareBoard undo', function (data) {
		cUndo(data.undoImg);
	});

	shareBoard.on('shareBoard redo', function (data) {
		cRedo(data.redoImg);
	});

	var canvas = document.querySelector('canvas');
	var context = canvas.getContext('2d');

	context.lineWidth = 4;
	context.lineCap = 'round';
	context.fillStyle = 'black';
	context.strokeStyle = 'black';

	var positioning = null;
	var drawing = false;

	canvas.addEventListener('mousedown', function (event) {
		drawArc(event);
		drawing = true;
	}, false);

	canvas.addEventListener('mousemove', function (event) {
		if (drawing == true) {
			drawLine(event);
		}
	}, false);
	// cPush();
	canvas.addEventListener('mouseup', function (event) {
		if (drawing == true) {
			drawLine(event);
			drawing = false;
			shareBoard.json.emit('shareBoard push', { dataUrl: canvas.toDataURL() });
		}
	}, false);

	canvas.addEventListener('mouseout', function (event) {
		if (drawing == true) {
			drawLine(event);
			drawing = false;
		}
	}, false);

	var redo = document.getElementById('redo');
	redo.addEventListener('click', function () {
		shareBoard.json.emit('shareBoard redo', 'redo');
	}, false);

	var undo = document.getElementById('undo');
	undo.addEventListener('click', function () {
		shareBoard.json.emit('shareBoard undo', 'undo');
	}, false);

	var save = document.getElementById('save');
	save.addEventListener('click', function () {
		var url = canvas.toDataURL();
		window.open(url, 'data url');
	}, false);

	var clear = document.getElementById('clear');
	clear.addEventListener('click', function () {
		shareBoard.json.emit('shareBoard clear', {});
		context.clearRect(0, 0, canvas.width, canvas.height)
	}, false);

	var colors = document.getElementById('colors').childNodes;
	for (var i = 0, color; color = colors[i]; i++) {
		if (color.nodeName.toLowerCase() != 'div') continue;
		color.addEventListener('click', function (event) {
			var style = event.target.getAttribute('style');
			var color = style.match(/background:(#......)/)[1];
			context.strokeStyle = color;
			context.fillStyle = context.strokeStyle
		}, false);
	}

	function drawArc(event) {
		event.preventDefault();
		positioning = position(event);
		var points = {
			s: 'arc'
			, x: positioning.x
			, y: positioning.y
			, c: context.strokeStyle
			, id: canvas.id
		}
		shareBoard.json.emit('shareBoard points', points);
		painting(points);
	}

	function drawLine(event) {
		event.preventDefault();
		var positions = position(event);
		var points = {
			s: 'line',
			x: positions.x,
			y: positions.y,
			xp: positioning.x,
			yp: positioning.y,
			c: context.strokeStyle,
			id: canvas.id
		}
		shareBoard.json.emit('shareBoard points', points);
		painting(points);
		positioning = points;
	}

	function painting(points) {
		if (canvas.id == points.id) {
			context.strokeStyle = points.c;
			context.fillStyle = context.strokeStyle;
			switch (points.s) {
				case 'line':
					context.beginPath();
					context.moveTo(points.x, points.y);
					context.lineTo(points.xp, points.yp);
					context.closePath();
					context.stroke();
					break;
				case 'arc':
					context.beginPath();
					context.arc(points.x, points.y, context.lineWidth / 2, 0, Math.PI * 2, true)
					context.fill();
					context.beginPath();
					context.moveTo(points.x, points.y);
					break;
			}
		}
	}
}, false);

function position(event) {
	var rect = event.target.getBoundingClientRect();
	return {
		x: event.clientX - rect.left - 12
		, y: event.clientY - rect.top - 12
	}
}