$(document).ready(function() {

	$('.benefits-carousel__arrow').click(function() {
		var imageItems = $('.benefits-carousel__image-item'),
			index = 0;

		imageItems.map(function(idx, item) {
			if ($(item).hasClass('active')) {
				activeImageItem = item;
				index = idx;
			}
		});

		function switchGradient(selector, oldGradient, newGradient) {
			console.log($(selector));
			$(selector).removeClass(oldGradient);
			$(selector).addClass(newGradient);
		}

		switch (index) {
			case 0: 
				switchGradient('.benefits-carousel__gradient', 'benefits-carousel__gradient--orange', 'benefits-carousel__gradient--blue');
				break;
			case 1:
				switchGradient('.benefits-carousel__gradient', 'benefits-carousel__gradient--blue', 'benefits-carousel__gradient--yellow');
				break;
			case 2: 
				switchGradient('.benefits-carousel__gradient', 'benefits-carousel__gradient--yellow', 'benefits-carousel__gradient--tangerine');
				break;
			default:
				switchGradient('.benefits-carousel__gradient', 'benefits-carousel__gradient--tangerine', 
					'benefits-carousel__gradient--orange');
		}

		$('.benefits-carousel__image-item--' + index).removeClass('active');
		$('.benefits-carousel__copy-item--' + index).removeClass('active');
		$('.benefits-carousel__bullet-item--' + index).removeClass('active');

		if (index >= (imageItems.length - 1)) {
			index = 0;
		} else {
			index++;
		}

		
		$('.benefits-carousel__image-item--' + index).addClass('active');		
		$('.benefits-carousel__copy-item--' + index ).addClass('active');		
		$('.benefits-carousel__bullet-item--' + index).addClass('active');
	});
});