(function($) {
	$.fn.touch = function(settings) {

		settings = $.extend({
			click: true,
			dragX: false,
			dragY: false,
			zoom: false,
			onclick: null,
			ondragstart: null,
			ondragmove: null,
			ondragend: null,
			onzoom: null,
			onzoomstart: null
		}, settings);

		var opts = [];
		opts = $.extend({}, $.fn.touch.defaults, settings);
		var elementsToIgnore = "|INPUT|SELECT|OPTION|TEXTAREA|A|";

		return this.each(function() {
			$(this).data("touch", opts);
			if ('ontouchstart' in this) {
				this.ontouchstart = touchstart;
			} else {
				this.onmousedown = mousedown;
			}
			if ('ontouchmove' in this) {
				this.ontouchmove = touchmove;
			} else {
				this.onmousemove = mousemove;
			}
			if ('ontouchend' in this) {
				this.ontouchend = touchend;
			} else {
				this.onmouseup = mouseup;
			}
			if ('ontouchcancel' in this) {
				this.ontouchcancel = touchcancel;
			}
		});

		function touchstart(e) {
			//	if (elementsToIgnore.indexOf("|" + e.target.tagName + "|") >= 0) return;
			e.preventDefault();
			var _opts = $(this).data("touch");
			_opts.mouseisdown = true;
			_opts.dragging = false;
			_opts.zooming = false;
			if (_opts.click && !_opts.dragX && !_opts.dragY && !_opts.zoom && _opts.onclick != null) {
				return _opts.onclick(e, this);
			}
			_opts.clicking = _opts.click;
			if (e.touches && e.touches.length == 1) {
				_opts.touchorigin = { left: e.touches[0].screenX, top: e.touches[0].screenY };
				_opts.originalposition = $(this).offset();
				if (_opts.ondragstart != null && (_opts.dragX || _opts.dragY)) {
					_opts.ondragstart({ screenX: e.touches[0].screenX, screenY: e.touches[0].screenY, originalEvent: e }, this);
				}
			}

			if (e.touches.length == 2) {
				_opts.dragging = false;
				_opts.clicking = false;
				_opts.zooming = true;
				_opts.touches = e.touches;
				var center = { X: (e.touches[0].screenX + e.touches[1].screenX) / 2, Y: (e.touches[0].screenY + e.touches[1].screenY) / 2 };
				if (_opts.onzoomstart) {
					_opts.onzoomstart(center);
				}
			}
		}

		function mousedown(e) {
			//	if (elementsToIgnore.indexOf("|" + e.target.tagName + "|") >= 0) return;
			e.preventDefault();
			var _opts = $(this).data("touch");
			_opts.mouseisdown = true;
			_opts.dragging = false;
			if (_opts.ondragstart != null && (_opts.dragX || _opts.dragY)) {
				_opts.ondragstart({ screenX: e.screenX, screenY: e.screenY, originalEvent: e }, this);
			}
			if (_opts.click && !_opts.dragX && !_opts.dragY && !_opts.zoom && _opts.onclick != null) {
				return _opts.onclick(e, this);
			}
			_opts.clicking = _opts.click;
			_opts.touchorigin = { left: e.screenX, top: e.screenY };
			_opts.originalposition = $(this).offset();
		}

		function touchmove(e) {
			//	if (elementsToIgnore.indexOf("|" + e.target.tagName + "|") >= 0) return;
			e.preventDefault();
			var _opts = $(this).data("touch");
			if (e.touches.length == 1 && (_opts.dragX || _opts.dragY) && !_opts.zooming) {
				var x = e.touches[0].screenX - _opts.touchorigin.left;
				var y = e.touches[0].screenY - _opts.touchorigin.top;
				var alpha = Math.atan(y / x);
				_opts.clicking = false;
				_opts.dragging = true;
				if (_opts.ondragmove != null) {
					_opts.ondragmove({ screenX: e.touches[0].screenX, screenY: e.touches[0].screenY, originalEvent: e }, this);
				}

				var skipDrag = _opts.dragY && !_opts.dragX && Math.abs(alpha) < Math.PI / 8;
				if (!skipDrag) {
					$(this).offset({ left: _opts.dragX ? _opts.originalposition.left + e.touches[0].screenX - _opts.touchorigin.left : _opts.originalposition.left, top: _opts.dragY ? _opts.originalposition.top + e.touches[0].screenY - _opts.touchorigin.top : _opts.originalposition.top });
				}
			}
			if (e.touches.length == 2 && _opts.zoom) {
				_opts.dragging = false;
				var d1 = Math.sqrt(Math.pow(_opts.touches[0].screenX - _opts.touches[1].screenX, 2) + Math.pow(_opts.touches[0].screenY - _opts.touches[1].screenY, 2));
				var d2 = Math.sqrt(Math.pow(e.touches[0].screenX - e.touches[1].screenX, 2) + Math.pow(e.touches[0].screenY - e.touches[1].screenY, 2));
				var center = { X: (e.touches[0].screenX + e.touches[1].screenX) / 2, Y: (e.touches[0].screenY + e.touches[1].screenY) / 2 };
				if (_opts.onzoom) {
					_opts.onzoom(d2 / d1, center);
				}
			}
		}

		function mousemove(e) {
			//	if (elementsToIgnore.indexOf("|" + e.target.tagName + "|") >= 0) return;
			e.preventDefault();
			var _opts = $(this).data("touch");
			if (!_opts.mouseisdown) return false;
			if (_opts.dragX || _opts.dragY) {
				_opts.clicking = false;
				_opts.dragging = true;
				if (_opts.ondragmove != null) {
					_opts.ondragmove({ screenX: e.screenX, screenY: e.screenY, originalEvent: e }, this);
				}
				$(this).offset({ left: _opts.dragX ? _opts.originalposition.left + e.screenX - _opts.touchorigin.left : _opts.originalposition.left, top: _opts.dragY ? _opts.originalposition.top + e.screenY - _opts.touchorigin.top : _opts.originalposition.top });
			}
		}

		function touchend(e) {
			//	if (elementsToIgnore.indexOf("|" + e.target.tagName + "|") >= 0) return;
			e.preventDefault();
			var _opts = $(this).data("touch");
			_opts.mouseisdown = false;
			if (_opts.click && _opts.clicking && _opts.onclick != null) {
				_opts.onclick(e, this);
			} else if (_opts.dragging && (_opts.dragX || _opts.dragY)) {
				if (_opts.ondragend != null) {
					_opts.ondragend(e, this);
				}
			} else {
				$(e.target).trigger("click");
			}
			_opts.clicking = false;
			_opts.dragging = false;
			return false;
		}

		function mouseup(e) {
			//	if (elementsToIgnore.indexOf("|" + e.target.tagName + "|") >= 0) return;
			e.preventDefault();
			var _opts = $(this).data("touch");
			_opts.mouseisdown = false;
			if (_opts.click && _opts.clicking && _opts.onclick != null) {
				_opts.onclick(e, this);
			} else if (_opts.dragging && (_opts.dragX || _opts.dragY)) {
				if (_opts.ondragend != null) {
					_opts.ondragend(e, this);
				}
			}
			_opts.clicking = false;
			_opts.dragging = false;
			return false;
		}

		function touchcancel(e) {
			var _opts = $(this).data("touch");
			_opts.clicking = false;
			_opts.dragging = false;
			if (_opts.ondragend != null) {
				_opts.ondragend(e, this);
			}
		}
	};
})(jQuery);