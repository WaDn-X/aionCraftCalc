String.format = function( text )
{
    //check if there are two arguments in the arguments list
    if ( arguments.length <= 1 )
    {
        //if there are not 2 or more arguments there’s nothing to replace
        //just return the original text
        return text;
    }
    //decrement to move to the second argument in the array
    var tokenCount = arguments.length - 2;
    for( var token = 0; token <= tokenCount; token++ )
    {
        //iterate through the tokens and replace their placeholders from the original text in order
        text = text.replace( new RegExp( "\\{" + token + "\\}", "gi" ),arguments[ token + 1 ] );
    }
    return text;
};

(function($) {
   
   $.fn.aionCraftCalc = function(settings) {

		var config = {
		  debug: 0,
			L10N : "en_US",
			txtFilter : $("#txtFilter"),
			btnFilter : $("#btnFilter"),
			btnCreate : $("#btnCreate"),
			txtCreate : $("#txtCreate"),
			listRenew : $("#btnUpdateList"),
			index : "./data.xml",
			itemUrl : "http://www.aiondatabase.com/xml/en_US/items/xmls/{0}.xml",
			inGameRecipeLink : "[recipe:{0}]",
			inGameItemLink : "[item:{0}]",
			recipeListUrl : "http://www.aiondatabase.com/xml/{0}/recipes/recipelist.xml",
			recipeItemUrl : "http://www.aiondatabase.com/xml/{0}/recipes/xmls/{1}.xml",
			itemQualities : {
			 0 : "#ADADAD",
			 1 : "#F1F1F1",
			 2 : "#69E15E",
			 3 : "#4CCFFF",
			 4 : "#FFC103",
			 5 : "#FF8033",
			 6 : "#800080"
      }
		};
		
    var cache = {}
		if (settings) $.extend(config, settings);
		
    /* FUNCTIONS */    
    var debug = function(str,level){
      if(config.debug){
        if(!level){
          $.n(str,{templateTarget: ".log"})
        }else{
          $.n.warning(str,{templateTarget: ".log"})
        }
      }
    }
    
    var msg = function(str){
       $.n(str,{templateTarget: ".log"})
    }
    /* SEARCH */    
	  var has_words = function( str, words, caseSensitive ){
	    var text = caseSensitive ? str : str.toLowerCase();
	    for (var i=0; i < words.length; i++) {
	      if (text.indexOf(words[i]) === -1) return false;
	    }
      return true;
	  }

    /* LIST */    
    var fetchItemList = function(itemType,callback){
      var url =  String.format(config.recipeListUrl,config.L10N)
      if(!callback) callback = function(data,status){ debug("data recieved : "+data)}
      $.get(url,callback)      
    }
    var renderList = function(o,data){
  		data.each(function(i,a){
  			o.append(renderItem(a))  			
  		})
  		updateList(o)
    }
    var updateList = function(o){
      o.find(".item").removeClass("even").removeClass("odd")    
      o.find(".item:even").addClass("even")  		
    }    
    /* SEARCH/FILTER */    
    var filterItems = function(attr,val){
        var results = config.index.find("aionrecipe").map(function(){
          var name = $(this).attr("name")
          if(has_words(name,val.toLowerCase().split(" "),false)){
            return $(this).clone()            
          }
        });
        debug("filterItems(attr: "+attr+", val : "+val+")<br/>Results : "+results.size(),1)
                
        return results
    }
    var getComboNormalName = function(str){
      return str.replace(/fine |luxury |superb /gi,"")
    }
    

    /* ITEM */    
    var findOrCreateItem = function(currentObj,name,callback){
      name = getComboNormalName(name)
      
      var match = false
      var name = ": "+name

      // look through already opened items
      $(".list .item").each(function(i,item){
        if(!match && $(item).attr("name").indexOf(name)>=0){ match = $(item)}
      })

      
      //look through reference list      
      if(match == false){
        var results = config.index.find("aionrecipe[name$='"+name+"']")
        
        if(results.size() > 0){
          match = renderItem(results.get()[0])
          //var isPurchased = currentObj.find(".details table .name:contains('"+name+"')").parent().prev().find("input.gathered")
          
          if(match.attr("name").indexOf("orph")>=0 ){
            //if(isPurchased.size()>0 )$(".list").append(isPurchased.attr("checked")+"<br/>")  
          //check that this item has not been flagged for purchasing instead of crafting.
          }else{
  
            var list = $(".list")
                list.append(match)
                 updateList(list)
          }          
        }
      }
      
     //$.n("searching for : "+name + (match?", results : name="+match.attr("name")+" : fetched="+match.data("fetched"):""))

      // if match found, fetch data if not alread fetched.  
      if(match){        
       if(match.attr("fetched")<1){
        fetchDetails(match,callback)
       }else{
        callback(match)
        
       }
      }else{
        //$.n.error("No recipe found for : "+name)
      }
      
    }
    
    var toggleRecipeDetailsPanel = function(item,openAnyway){
    
      if(openAnyway || !item.attr("open")){
        if(item.attr("fetched")<1){
          msg(item.attr("id"))
          fetchDetails(item,null)
        }
        item.find(".details").show()
        item.attr("open",1)
      }else{
        item.find(".details").hide()
        item.attr("open",0)
      }

    }
    
    var CreateItemTitle = function(name){
			var title = $("<div>")
            .addClass('title')
          
          $("<a>")
            .addClass('itemLink')
            .text("<link>")
            .click(function(e){
              var item = $(this).parent().parent().parent()
              var form = $("<div>")
                            .addClass("modalForm")
                            .appendTo(title)
                  
    			    $("<a>")
                .addClass('close')
                .text("[ x ]")
                .click(function(e){
        		      var p = $(this).parent()
                      p.remove()
                })
                .mouseover(function(){
                  $(this).addClass("hover")
                })
                .mouseout(function(){
                  $(this).removeClass("hover")
                })
                .appendTo(form)
              
              $("<div>").addClass("section").appendTo(form)
                .append($("<label>WWW Link : </label>"))
                .append($("<input type='text'>").val(String.format( config.itemUrl,item.attr("id") )))
                
              
              $("<div>").addClass("section").appendTo(form)
                .append($("<label>Game Link : </label>"))
                .append($("<input type='text'>").val(String.format( config.inGameRecipeLink,item.attr("id") )))
                

                  
            })
            .appendTo(title)
                        
          $("<a>")
            .addClass('name')
            .text(name)
            .click(function(e){
              var item = $(this).parent().parent().parent()
              toggleRecipeDetailsPanel(item) 
            })
            .appendTo(title)
                        
			    $("<a>")
            .addClass('close')
            .text("x")
            .click(function(e){
    		      var item = $(this).parent().parent().parent()
    		      var parent = item.parent()
                  item.remove()
                  updateList(parent)
            })
            .appendTo(title)
            
			    $("<a>")
            .addClass('isolate')
            .text("#")
            .click(function(e){
    		      var item = $(this).parent().parent().parent()
    		      var itemID = parseInt(item.attr("id"))
    		      var parent = item.parent()
    		      parent.find(".item").each(function(index,obj){
    		        stepID = parseInt($(obj).attr("id"))
    		        if(itemID!=stepID)$(obj).remove()
              })
              updateList(parent)
            })
            .appendTo(title)

            title.find("a").mouseover(function(){
              $(this).addClass("hover")
            }).mouseout(function(){
              $(this).removeClass("hover")
            });

     return title
    }    

    var renderItem = function(data){
  			var itemData = $(data)
  			var item = $("<div class='item'>")
            item.attr("id",itemData.attr("id"))
            item.attr("name",itemData.attr("name"))
            item.attr("open",0)
            item.attr("fetched",0)
            
            
  			var itemInner = $("<div>").addClass("item-inner")
  			    itemInner.append( CreateItemTitle(itemData.attr("name")) )

        var details = $("<div class='details'>")
        var meta = $("<div>").addClass("meta")
            details.append(meta)

        var quantity = $("<div>").addClass("inputQty")
        var btnCost = $("<input type='button' class='btnFetch' value='fetch'/>")
            btnCost.click(function(e){
              var btn = $(this)
              var parent = btn.parent().parent().parent().parent()
              var output = parent.find(".details table")
                  parent.data("tmpList",{})
                  findAllComponents(parent,function(obj){
                    var list = calculateRequirements(parent.data("tmpList"), parent, 1)
                    renderShoppingList(output.find("tbody"),list)
                  })
            })
            btnCost.appendTo(quantity)
        var txtQuantity = $("<input type='text' class='txtQuantity' name='"+item.attr("name")+"_qty' value='0'/>")
            txtQuantity.spinner({ min : 0 });
            txtQuantity.appendTo(quantity)    
            

        var btnQuantity = $("<input type='button' class='btnQuantity' value='calculate'/>")
            btnQuantity.click(function(e){
              var btn = $(this)
              var amount = btn.prev().val()
              var parent = btn.parent().parent().parent().parent()
              var output = parent.find(".details table")
              var list = parent.data("tmpList")
                  //renderShoppingList(output.find("tbody"),calculateRequirements(list, parent, amount))
                  updateShoppingList( output.find("tbody"), calculateRequirements({}, parent, amount))
                  calculateCosts(output)
                                        
            })
            btnQuantity.appendTo(quantity)
                    
            quantity.appendTo(details)

        var recipe = $("<table>")
        var recipeHeader = $("<thead>").appendTo(recipe)
        var recipeHeaderRow = $("<tr>").appendTo(recipeHeader)
            recipeHeaderRow.append( $("<th>").addClass("options").text("^") )
            recipeHeaderRow.append( $("<th>").addClass("amount").text("#") )
            recipeHeaderRow.append( $("<th>").addClass("name").text("name") )
            recipeHeaderRow.append( $("<th>").addClass("costPerItem").text("@1") )
            recipeHeaderRow.append( $("<th>").addClass("totalCost").text("@*") )

            recipe.append("<tbody>")
            recipe.append("<tfoot>")
            recipe.appendTo(details)

        details.appendTo(itemInner)
        details.hide()
        item.append(itemInner)
        return item
    }
    
    var updateShoppingList = function(output,list){
      output.find(".name a").each(function(i,a){
        $(a).parent().prev().find("input").val(list[$(a).text()])
      })
    }
                                                     
    var renderShoppingList = function(output,list){
      output.empty()
      for(var item in list){
        var recipeItemRow = $("<tr>")
            recipeItemRow.append(
              $("<td>").addClass("options").append($("<input type='checkbox' class='gathered' unchecked title='item is purchased, no dependancies required.'>"))
            ) 
            recipeItemRow.append( $("<td>").addClass("amount").append( $("<input type='text' value='0'>").val(list[item]) )) 
            recipeItemRow.append( $("<td>").addClass("name").append(
              $("<a>")
                .text(item)
                .click(function(){
                   findOrCreateItem($(this).text(),null)
                })
            ))
            recipeItemRow.append($("<td>").addClass("costPerItem").append($("<input type='text' value='0'>")))
            recipeItemRow.append($("<td>").addClass("totalCost").append($("<input type='text' value='0'>")))
              
        output.append(recipeItemRow)
      }
      var footer = output.parent().find("tfoot")
          footer.empty()
      
      $("<tr>")
        .append($("<td colspan='5'>").addClass("productionCost")
        .append($("<label>Production Cost</label><input id='productionCost' type='text' value='0'>")) )
        .appendTo(footer)
      $("<tr>")
        .append($("<td colspan='5'>").addClass("profitMargin")
        .append($("<label>Profit Margin % </label><input id='profitMargin' type='text' value='15'>")) )
        .appendTo(footer)
      $("<tr>")
        .append($("<td colspan='5'>").addClass("totalProfit")
        .append($("<label>Total</label><input type='text'id='totalProfit' value='0'>")) )
        .appendTo(footer)
    }
    
    var fetchDetails = function(obj,callback){
      var url = String.format(config.recipeItemUrl, config.L10N, obj.attr("id"))
      debug("fetching : " + obj.attr("id") +":"+obj.attr("name"))
      $.get(url,function(data,status){
        var details = obj.find(".details table")
        var tmpData = {
            profession : $(data).find("skill").text(),
            professionLevel : $(data).find("skillpoints").text(),
            quality : $(data).find("quality").text(),
            components : {}  
        }
        var componentsData = $(data).find("component")
            componentsData.map(function(){
              tmpData.components[$(this).text()] = $(this).attr("amount")
            })
                      
        obj.data("recipe",tmpData)
        obj.find(".title a.name").css({
          "color" : config.itemQualities[tmpData.quality]
        })
        
        renderShoppingList(details.find("tbody"),tmpData.components)
        
        obj.find(".meta").text("lvl"+tmpData.professionLevel +" "+tmpData.profession)

        obj.attr("open",1)
        obj.attr("fetched",1)

        if(callback){
          callback(obj)
        }
      })
      
    }
    
    /* CALCULATE */    
    var findAllComponents = function(obj,callback){
      $.each(obj.data("recipe").components,function(i,a){
        findOrCreateItem(obj,i,function(item){
          findAllComponents(item,false)        
        })
      })
      if(callback)callback(obj)
      return      
    }
    

    var calculateRequirements = function(list,recipe,cnt){
      var extras = {}
      $.each(recipe.data("recipe").components,function(i,a){
        var amount = parseInt(a)*cnt
        list[i] = (list[i]?list[i]+=amount:amount)
        var item = $(".list .item[name$='"+getComboNormalName(i)+"']")
        //$(".list").append("searching for : "+getComboNormalName(i)+" = "+item.size()+"<br/>")

        if(item.size()>=1){
          calculateRequirements(list,item,amount)
        }
      })
      return list
    }
    
    var calculateCosts = function(table){
      var totals = {}
      var totalCost = 0
      var margin = parseInt(table.find("tfoot .profitMargin input").val())
            
      table.find("tbody tr").each(function(i,a){
        var row = $(a)
        var amount = row.find(".amount input").val()
        var costPerItem = row.find(".costPerItem input")
            costPerItem.val(costPerItem.val()==0?100:costPerItem.val()) // insert cost for crafting time
            
        totals[i]=parseInt(amount)*parseInt(costPerItem.val())
        row.find(".totalCost input").val(totals[i])
      })
      
      $.each(totals,function(i,a){
        totalCost+=a
      })
      table.find("tfoot .productionCost input").val(totalCost)
      table.find("tfoot .totalProfit input").val( ((totalCost / 100) * margin) + totalCost )

    }
     
    /* CREATE NEW ITEM TEXT FIELD */		
   $("input[type='text']").each(function(i,a){
      var item = $(a)
      item.data("dirty",false)
      item.data("cache","")
      item.val(item.attr("defaultText"))
      
      item.focus(function(){
        var obj = $(this)
        if(obj.val() == obj.attr("defaultText")){
          obj.val("")
        }          
      })
      
      item.blur(function(){
        var obj = $(this)
        var cache = obj.data("cache")
        if(obj.val()==""){
          if(obj.data("dirty")){
            txt = obj.data("cache")
          }else{
            txt = obj.attr("defaultText")
          }
          obj.val(txt)
        }
      })

    })
      
    config.listRenew.click(function(e){
      debug("fetching...")
      fetchItemList("recipe", function(data,status){
        config.index = $(data)
        debug("data retrieved : "+config.index.find("aionrecipe").size() )
      })
    })
    
    if(config.debug){
      $(".control #btnClearLog").click(function(e){
        $(".log #jquery-notifications").empty()
      })
    }else{
      $(".log").hide()
      $("body").height(340)
      $(".list").height(200)
    }

    config.txtFilter.keyup(function(e){
      if(e.keyCode==13){
          this.filter(this)
      }
    })
    config.txtFilter.filter=function(){
      if($(this).val().length>0){
        config.list.empty()
        var value = $(this).val()
        var attr = isNaN(value)?"name":"id"
        debug("searching by " + attr + " : " + value)
        renderList($(".list"),filterItems(attr, value))
      }
    }
    config.btnFilter.click(function(e){
      config.txtFilter.filter(config.txtFilter)
    })
    

    fetchItemList("recipe", function(data,status){
      config.index = $(data)
      debug("data retrieved : "+config.index.find("aionrecipe").size() )
    })
    
    window.detachEvent("onclick",function(e){ return false });
    window.detachEvent("ondrag",function(e){ return false });
    
    $(".toolbar, .dragHandle").hide()
    /*
    $(".dragHandle").draggable({
      axis: 'x',
      start: function(event, ui) {$(".list").html(ui.offset.top)},
      drag: function(event, ui) {$(".list").html(ui.offset.top)},
      stop: function(event, ui) {$(".list").html(ui.offset.top)}
    });
    */
    
    $(".increaseSize").click(function(e){
      $("body").height($("body").height()+100)
      $("#canvas").height($("#canvas").height()+100)
      $(".list").height($(".list").height()+100)
    })
    $(".decreaseSize").click(function(e){
      $("body").height($("body").height()-100)
      $("#canvas").height($("#canvas").height()-100)
      $(".list").height($(".list").height()-100)
    })
    

 	} 
})(jQuery);
