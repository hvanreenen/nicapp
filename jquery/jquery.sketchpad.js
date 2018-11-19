
 (function ($) {
	$.fn.sketchpad = function(settings) {
		if (settings) {
		    var options = { penColor: "blue", penWidth: 3, bgColor: "#dadaf7", dataURL: null };
			$.extend(options, settings);
		}
		return this.each(function() {
			var self = $(this);
			var coords;
			var mouseIsDown = false;
			touchstart = function (e) {
				mouseIsDown = true;
			    var context = self.data("sketchpadContext");
				var data = self.data("sketchpad");
				context.lineWidth = data.penWidth;
				context.fillStyle = data.penColor;
				context.strokeStyle = data.penColor;
				var offset = self.offset();
				if (e.touches && e.touches.length == 1) {
					coords = { left: e.touches[0].screenX - offset.left, top: e.touches[0].screenY - offset.top };
					context.beginPath();
					context.arc(coords.left, coords.top, data.penWidth / 2, 0, Math.PI * 2, true);
					context.closePath();
					context.fill();
					context.moveTo(coords.left, coords.top);
					e.preventDefault();
				}
				else if (e.button == 0) {
				    coords = { left: e.clientX - offset.left, top: e.clientY - offset.top };
				    context.beginPath();
				    context.arc(coords.left, coords.top, data.penWidth / 2, 0, Math.PI * 2, true);
				    context.closePath();
				    context.fill();
				    context.moveTo(coords.left, coords.top);
				    e.preventDefault();
				}
			}
			touchmove = function(e) {
				if (mouseIsDown) {
				    var context = self.data("sketchpadContext");
				    var offset = self.offset();
				   
					if (e.touches) {
					    coords = { left: e.touches[0].screenX - offset.left, top: e.touches[0].screenY - offset.top };
					}
					else if (e.button == 0) {
					    coords = { left: e.clientX - offset.left, top: e.clientY - offset.top };
					}
					if (coords) {
					    context.lineTo(coords.left, coords.top);
					    context.stroke();
					}
					e.preventDefault();
				}
			}
			touchend = function(e) {
				var context = self.data("sketchpadContext");
				var data = self.data("sketchpad");
				context.beginPath();
				context.arc(coords.left, coords.top, data.penWidth / 2, 0, Math.PI * 2, true);
				context.closePath();
				context.fill();

				coords = null;
				mouseIsDown = false;
			}

			var data = self.data("sketchpad");
			if (data) {
				self.data("sketchpad", options);
			} else {
				var context = this.getContext("2d");
				self.data("sketchpadContext", context);
				self.data("sketchpad", options);
				// Attach event handlers
				this.addEventListener("touchstart", touchstart);
				this.addEventListener("touchmove", touchmove);
				this.addEventListener("touchend", touchend);

				this.addEventListener("mousedown", touchstart);
				this.addEventListener("mousemove", touchmove);
				this.addEventListener("mouseup", touchend);
			}
			var context = self.data("sketchpadContext");
			settings.context2d = context;
			context.fillStyle = "white";
			context.fillRect(0, 0, self[0].width, self[0].height);
			if (options.dataURL != null && options.dataURL.length > 0) {
				var img = document.createElement("img");
				img.onload = function() {
					context.drawImage(img, 0, 0, self[0].width, self[0].height);
				}
				img.src = options.dataURL;
			} else {
				context.beginPath();
				context.rect(0, 0, self[0].width, self[0].height);
				context.fillStyle = options.bgColor;
				context.fill();
			}

		});
	}
})(jQuery); 


