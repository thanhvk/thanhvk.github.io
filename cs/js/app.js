var main = function(){

	//Slide images when start

	var slide = setInterval(function(){nextSlide()}, 5000);
	
	//Build function next slider
	
	var nextSlide = function(){
		var currentSlide = $('.active-slide');
		var nextSlide = currentSlide.next();
		
		if(nextSlide.length === 0){
			nextSlide = $('.slide').first();
		};
		
		currentSlide.fadeOut(1000).removeClass('active-slide');
		nextSlide.fadeIn(1000).addClass('active-slide');
		
		var currentDot = $('.active-dot');
		var nextDot = currentDot.next();
		
		if (nextDot.length === 0){
			nextDot = $('.dot').first();
		};
		
		currentDot.removeClass('active-dot');
		nextDot.addClass('active-dot');
		};
	
	//Even click next button
		
	$('.narrow-next').click(function(){
		clearInterval(slide);
		nextSlide();
	});
	
	// Build function previous slider
	
	var prevSlide = function(){
		var currentSlide = $('.active-slide');
		var prevSlide = currentSlide.prev();
		
		if(prevSlide.length === 0){
			prevSlide = $('.slide').last();
		};
		
		currentSlide.fadeOut(3000).removeClass('active-slide');
		prevSlide.fadeIn(3000).addClass('active-slide');
		
		var currentDot = $('.active-dot');
		var prevDot = currentDot.prev();
		
		if (prevDot.length === 0){
			prevDot = $('.dot').last();
		};
		
		currentDot.removeClass('active-dot');
		prevDot.addClass('active-dot');
	};
	
	//Even click previous button
	
	$('.narrow-prev').click(function(){
		clearInterval(slide);
		prevSlide();
	});
};

$(document).ready(main);