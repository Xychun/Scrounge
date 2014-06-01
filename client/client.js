////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////// HELP SECTION /////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

//[JQUERY: ATTR = Attribute Selector!]
// expl: $(this).attr('id') 

  var clicked = false;
// var elm = document.createElement("div");
// var jelm = $(elm);//convert to jQuery Element
// var htmlElm = jelm[0];//convert to HTML Element

// Meteor - get object : $(event.target).css({"background-color":"orange"});
// Meteor - get object ID: alert($(event.currentTarget.ID));     alert(event.target.id);

////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////// CLIENT /////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

if (Meteor.isClient){
	//Subscriptions
	Meteor.subscribe("userData");

  	//Get Data
  	Template.gameMiddle.mineSlots = function () {
  		var self = Meteor.users.findOne({_id: Meteor.userId()});
  		if(self){
  			var menu = self.menu;
  			var cu = self.cu;
  			if(menu == 'mine'){
  				return mine.find({});
  			}
  			if(menu == 'laboratory'){
  				return laboratory.find({});
  			}
  			if(menu == 'colosseum'){
  				return colosseum.find({});
  			}
  		}  
  	};

  	/*Seltsame Darstellungsfehler bedürfen es, dass der Hintergrund um ein Pixel weiter verschoben wird, als die Datei es hergibt (beobachtet in Chrome)*/
  	Template.standardBorder.events({

      'click #testButton' : function(e, t){

        if(!$("#mineBuyMenu").length) {

          Router.current().render('mineBuyMenu', {to: 'buyMenu'});

        } 

        else {

          $('#mineBuyMenu').show();

        }

        },

        'click #testButton2' : function(e, t){

        if(!$("#characterView").length) {

          Router.current().render('characterView', {to: 'middle'});

        } 

        else {

          $('#characterView').show();

        }

        },

    });

	Template.masterLayout.events({
		'mouseover .slider' : function(e, t){
			slide_right();

		},
		'mouseout .slider' : function(e, t){
			slide_stop();

		}

	});


  //TODO: noch nicht fertig !
  Template.mineBuyMenu.events({

    'click #buyMenuYes' : function(e, t){

          $('#mineBuyMenu').hide();

        },

        'click #buyMenuNo' : function(e, t){

          $('#mineBuyMenu').hide();

        },
  })



	//TODO: noch nicht fertig !
	Template.gameMiddle.events({
		'click .slot' : function(e, t){
			//console.log(e.target);
			if($(this).next(".slot_a").height()==0)
			{
				console.log("slot clicked");
				$(this).next(".slot_a").animate({"height": "143px"},1000);
			}
			else if($(this).next(".slot_a").height()==143)
			{
				$(this).next(".slot_a").animate({"height": "0px"},1000);
			}

		},
		'click .slot_a' : function(e, t){
			//console.log("slot_a clicked");
		}

	});


	var time=1200; //Animationszeit in ms
	var c=1; //Start Kategorie
	var max_cat=6; //Anzahl Kategorien
	var interval;
	var ready_check;
	var size;
	var slots_count = 10;

	if ($(window).width() <= 1024){	
		//console.log("1024");
		ready_check=1;
	}	
	if ($(window).width() <= 1280 && $(window).width() >=1024){	
		//console.log("1280");
		ready_check=2;
	}	
	if ($(window).width() >= 1280){	
		//console.log("1920");
		ready_check=3;
	}

	function slide_left()
	{	
		size=size_check(); //Checkt welche Auflösung gerade vorhanden ist und passt die Animations-Daten an
		var pos=size.p;
		var pos_r=size.pr+"px";
		var pos_p="-="+size.pp+"px";
		
		if($("#k1").filter(':not(:animated)').length==1) //Wenn Animation läuft keine neue Anfangen
		{
			if($("#k2").position().left<pos) //Positionierung der Div's wenn Slide am anfang auf Startpunkt
			{
				$("#k2").css({ left: pos_r });
				$("#k1").css({ left: "0px" });
			}
			// Vorab Animation da Intervall erst nach [Time] anfängt
			$("#k1").filter(':not(:animated)').animate({ left: pos_p }, time , "linear" );
			$("#k2").filter(':not(:animated)').animate({ left: pos_p }, time , "linear" );
			//Rekursiver Intervall (unendlich)
			var action = function() {		
				if($("#k2").position().left<pos) //Positionierung der Div's wenn Slide wieder am Startpunkt
				{
					$("#k2").animate({ left: pos_r }, 0 , "linear" );
					$("#k1").animate({ left: "0px" }, 0 , "linear" );
				}	
				//Animation im laufenden Intervall	
				$("#k1").animate({ left: pos_p }, time , "linear" );
				$("#k2").animate({ left: pos_p }, time , "linear" );
				update("left");
			};
			//Start des Intervalls
			interval=setInterval(action, time);
			update("left");
		}
	}

	function slide_right()
	{	
		size=size_check(); //Checkt welche Auflösung gerade vorhanden ist und passt die Animations-Daten an
		var pos=size.p;
		var pos_r="-"+size.pr+"px";
		var pos_p="+="+size.pp+"px";
		
		if($("#k1").filter(':not(:animated)').length==1) //Wenn Animation läuft keine neue Anfangen
		{
			if($("#k1").position().left>-pos) //Positionierung der Div's wenn Slide am anfang auf Startpunkt
			{
				$("#k1").css({ left: pos_r });
				$("#k2").css({ left: "0px" });
			}
			// Vorab Animation da Intervall erst nach [Time] anfängt
			$("#k1").filter(':not(:animated)').animate({ left: pos_p }, time , "linear" );
			$("#k2").filter(':not(:animated)').animate({ left: pos_p }, time , "linear" );
			//Rekursiver Intervall (unendlich)
			var action = function() {		
				if($("#k1").position().left>-pos) //Positionierung der Div's wenn Slide wieder am Startpunkt
				{
					$("#k1").animate({ left: pos_r }, 0 , "linear" );
					$("#k2").animate({ left: "0px" }, 0 , "linear" );
				}	
				//Animation im laufenden Intervall	
				$("#k1").animate({ left: pos_p }, time , "linear" );
				$("#k2").animate({ left: pos_p }, time , "linear" );
				update("right");
			};
			//Start des Intervalls
			interval=setInterval(action, time);
			update("right");
		}
	}

	function slide_up()
	{	
		size=size_check(); //Checkt welche Auflösung gerade vorhanden ist und passt die Animations-Daten an
		var pos=size.p;
		var pos_r=size.pr+"px";
		var pos_p="-="+size.pp+"px";
		//console.log("s1: "+$("#s1").position().top);
		if($("#base_area_content").filter(':not(:animated)').length==1) //Wenn Animation läuft keine neue Anfangen
		{
			$("#base_up").attr("src","HoverUpButtonBrownHover.gif");
			
			if($("#base_area_content").position().top<=0)
			{
				// Vorab Animation da Intervall erst nach [Time] anfängt
				$("#base_area_content").filter(':not(:animated)').animate({ "top": "-=143px" }, time , "linear" );
				//Rekursiver Intervall (unendlich)
				var action = function() {		
					//Animation im laufenden Intervall	
					$("#base_area_content").animate({ "top": "-=143px" }, time , "linear" );
				};
				//Start des Intervalls
				interval=setInterval(action, time);
			}
		}
	}

	function slide_stop()
	{
		clearInterval(interval);
	}

	function update(direction)
	{	
		if(direction=="left"){
			c--;
		}
		else if(direction=="right"){
			c++;
		}
		
		if(c==0 && direction=="left")
		{
			c=max_cat;
		}
		else if(c==(max_cat+1) && direction=="right")
		{
			c=1;
		}
	}

	function size_check()
	{
		switch(ready_check)
		{
			case 3: var pos=256;
			var pos_plus=pos+10;
			break;
			case 2: var pos=170;
			var pos_plus=pos+7;
			break;
			case 1: var pos=136;
			var pos_plus=pos+6;
			break;
			default: console.log("failed to check size !(default)");
			break;
		}
		var pos_reset=pos_plus*max_cat;
		
		return {p: pos, pp: pos_plus, pr: pos_reset};
	}


	function repositioning(ready_check) //Bei Media Query Sprung neu Posi der Leiste [Parameter : Aktueller Media Querie]
	{	
		size=size_check();
		var pos=size.p;
		var pos_r=size.pr;
		var pos_p=size.pp;
		
		var cur_pos_right=(c*pos_p)-pos_p;
		var cur_pos_left=cur_pos_right-(pos_r);
		$("#k1").css({ left: cur_pos_left });
		$("#k2").css({ left: cur_pos_right });
	}

	$(window).resize(function(){
		if ($(window).width() <= 1024 && ready_check!==1){	
			//console.log("1024");
			ready_check=1;
			repositioning(ready_check);
		}	
		if ($(window).width() <= 1280 && $(window).width() >=1024 && ready_check!=2){	
			//console.log("1280");
			ready_check=2;
			repositioning(ready_check);
		}	
		if ($(window).width() >= 1280 && ready_check!=3){	
			//console.log("1920");
			ready_check=3;
			repositioning(ready_check);
		}	
	});

	//Deps.Autorun
	Deps.autorun(function () {
		if (!Meteor.user()){
    		//not logged in yet
    		// console.log("DEPS.AUTORUN: not logged in");
    	} else {
    		var self = Meteor.users.findOne({_id: Meteor.userId()});
    		var menu = self.menu;
    		var cu = self.cu;
    		if(cu && menu){
    			Meteor.subscribe(menu, cu, function(rdy){
    				// console.log("DEPS.AUTORUN: Sub: " + menu + ", " + cu + " - " + rdy);
    			});
    		}else{
    			// console.log("DEPS.AUTORUN: cu or menu undefined");
    		}
    	}
    });
}

/*  function hoverScroungeBase() {
	var pos = button.style.backgroundPosition;
	alert(pos);*/
