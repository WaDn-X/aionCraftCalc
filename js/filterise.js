(function($) {
   $.fn.filterise = function(settings) {
		/*
			selFilterList			 : obj containing filterable items
			selFilterListItem	 : selector of items that you want to filter
			selFilterAttribute : Attribute containing the text for which the item should be considered for filtering. 
		*/
		var config = {
			selFilterList : null,
			selFilterListItem	: null,
			selFilterAttribute: null,
			lastPhrase : "",
			ifHidden : function(elm){ return false; }
		};
		if (settings) $.extend(config, settings);

	  var has_words = function( str, words, caseSensitive ){
	    var text = caseSensitive ? str : str.toLowerCase();
	    //$(".debug").text("has_words : "+text)
	    for (var i=0; i < words.length; i++) {
	      if (text.indexOf(words[i]) === -1) return false;
	    }
	    return true;
	  }
	  


		$(this).keyup(function(){
		  /*
		    filterObj               : obj containing filterable items
		    filterList				       : selector of items that you want to filter
		    strSearch           : the search string
		*/

		  var new_hidden = false;
			var phrase = this.value
		  var lastPhrase = config.lastPhrase
		  if( lastPhrase === phrase ) return false;
		  var phrase_length = phrase.length;
		  var words = phrase.toLowerCase().split(" ");
		  var itemList = $( config.selFilterList )


			$(config.selFilterListItem)
				.removeClass("even")
			  .removeClass("odd")
			  
		  // if added one letter to last time,
		  // just check newest word and only need to hide
/*
		  var lastPhraseMinusOne = phrase.substr(0, phrase_length - 1)
		  var newVersionOfLastPhrase = (lastPhraseMinusOne === config.lastPhrase)
		  if( (words.length >= 1) && newVersionOfLastPhrase ) {
		    if( phrase[-1] === " " ){
		      config.lastPhrase = phrase;
		      return false;
		    }
		    var words = words[-1]; // just search for the newest word
		    // only hide visible rows
		    //matches = function(elem){;}
		    var elems = itemList.find(config.selFilterListItem+":visible")
		  }else{
		    new_hidden = true;
		  }
*/
	    var elems = itemList.find(config.selFilterListItem)

		  var zebra
		  elems.each(function(i,a){
		    var elem = $(this);
		    if (has_words( selFilterAttribute?elem.attr(selFilterAttribute):elem.text(), words, false )){
		    	 elem.show()
		   	}else{
		    	 elem.hide();
		    	 new_hidden = true
		    }
		  });

			$.each(itemList.find(config.selFilterListItem + ":visible:even"),function(){
				$(this).addClass("even")
			})
			
		  config.lastPhrase = phrase;
		  if(config.ifHidden && new_hidden ) config.ifHidden();
		  return itemList;

		})

	}
 
 })(jQuery);
