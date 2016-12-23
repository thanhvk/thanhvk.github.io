$(document).ready(function() {
	$.scrollSpeed(120, 800);

	$('a').smoothScroll({speed: 800});

	$('.hamburger').click(function() {
		var navbar 		= $('.navbar-collapse'),
			collapse 	= navbar.hasClass('collapse');

		if (collapse) {
			navbar.removeClass('collapse');
		} else {
			navbar.addClass('collapse');
		}
	});
});