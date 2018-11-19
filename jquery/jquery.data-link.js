(function($) {
	$.fn.link = function(settings) {
		var opts = [];
		opts = $.extend({}, $.fn.link.defaults, settings);

		return this.each(function() {
			var self = $(this);
			self.data("link", opts);
			var inputElements = $("input, select, textarea", self);
			if (opts.readonly) {
				inputElements.attr("readonly", "readonly");
			} else {
				inputElements.removeAttr("readonly");
			}
			inputElements.each(function() {
				var name = $(this).attr("name");
				if (name) {
					var val = opts.entity[name];
					$(this).val(val);
					if ($(this).get(0).tagName == "SELECT") {
						$(this).prop("selectedIndex", -1);
						$("option", $(this)).attr("selected", false);
						if (val instanceof Array) {
							var select = $(this);
							Enumerable.From(val).ForEach(function(iVal, index) {
								try {
									$('option[value=' + iVal + ']', select).attr("selected", "selected");
								} catch (e) { }
							});
						} else {
							$('option[value=' + val + ']', $(this)).attr("selected", "selected");
						}
						$(this).change();
					}
				}
			});
			if (!self.data("initialized")) {
				inputElements.change(function(e) {
					var opts = self.data("link");
					if (opts.readonly) return;
					var entity = opts.entity;
					var pn = e.target.name.split(".");
					var p = entity;
					while (pn.length > 1) {
						p = p[pn.shift()];
					}
					p[pn.shift()] = $(this).val();
					if (opts.onchange) {
						opts.onchange();
					}
				});
				self.data("initialized", true);
			}
		});
	};
})(jQuery);