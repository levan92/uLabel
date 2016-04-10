//Here is all the code that builds the list of objects on the right-hand 
//side of the Labelme tool.

//The styles for this tools are defined inside:
//annotationTools/css/object_list.css


var IsHidingAllPolygons = false;
var ProgressChecking = false;
//var IsHidingAllFilled = true;
var ListOffSet = 0;

//This function creates and populates the list 
function RenderObjectList() {
	// If object list has been rendered, then remove it:
	var scrollPos = $("#anno_list").scrollTop();
	if($('#anno_list').length) {
		$('#anno_list').remove();
	}

	var html_str = '<div class="object_list" id="anno_list" style="border:0px solid black;z-index:0;" ondrop="drop(event, -1)" ondragenter="return dragEnter(event)" ondragover="return dragOver(event)">';

	var Npolygons = LMnumberOfObjects(LM_xml);

//	name of image
	html_str += '<p style="font-size:14px;line-height:100%"><h>Image: <a href="javascript:GetThisURL();">'+main_media.file_info.im_name+'</a></h></p>';

	if (!ProgressChecking){
		//Checks progress by filling all polygons   
		html_str += '<p style="font-size:12px;line-height:50%" id="check_progress" ><a href="javascript:CheckProgress();"><b>Check progress</b></a> (s)</p>';
	} else {//Clear Progress check
		html_str += '<p style="font-size:12px;line-height:50%" id="end_check_progress"><a href="javascript:EndCheckProgress();" style="color:red"><b>Clear progress check</b></a> (h)</p>'; 
	}

	if (IsHidingAllPolygons){ //Polygons hidden, press to show outlines permanently
		html_str += '<p style="font-size:12px;line-height:50%"><a id="hold_poly" href="javascript:ShowAllPolygons();"><b>Press to hold outlines</b></a></p>';	  
	} else
	{ //Outlines held status msg
		html_str += '<p style="font-size:12px;line-height:50%"><a id="poly_held" style="text-decoration:none; font-style:italic; color:#708090;">Outlines held (\'Hide all\' to release)</a></p>';	  
	}
	//Hide all polygons
	html_str += '<p style="font-size:12px;line-height:50%"><a id="hide_all" href="javascript:HideAllPolygons();"><b>Hide all </b></a></p>';

	// Create DIV
	html_str += '<u><i>'+ Npolygons +'</i> classes labeled in all:</u>';


	html_str += '<ol>';

	for(var i=0; i < Npolygons; i++) {
		html_str += '<div class="objectListLink" id="LinkAnchor' + i + '" style="z-index:1; margin-left:0em"> ';

		html_str += '<li>';

		// show object name:
		html_str += '<a class="objectListLink"  id="Link' + i + '" '+
		'href="javascript:main_handler.AnnotationLinkClick('+ i +');" '+
		'onmouseover="main_handler.AnnotationLinkMouseOver('+ i +');" ' +
		'onmouseout="main_handler.AnnotationLinkMouseOut();" ';

		html_str += '>';

		var obj_name = LMgetObjectField(LM_xml,i,'name');
		html_str += obj_name;
		html_str += '</a>';
		html_str += '</li></div>';
	}

	html_str += '</ol><p><br/></p></div>';

	// Attach annotation list to 'anno_anchor' DIV element:
	$('#anno_anchor').append(html_str);
	$('#Link'+add_parts_to).css('font-weight',700); //
	$('#anno_list').scrollTop(scrollPos);
}


function RemoveObjectList() {
	$('#anno_list').remove();
}


function ChangeLinkColorBG(idx) {
	if(document.getElementById('Link'+idx)) {
		var isDeleted = parseInt($(LM_xml).children("annotation").children("object").eq(idx).children("deleted").text());
		if(isDeleted) document.getElementById('Link'+idx).style.color = '#888888';
		else document.getElementById('Link'+idx).style.color = '#0000FF';
		var anid = main_canvas.GetAnnoIndex(idx);
		// If we're hiding all polygons, then remove rendered polygon from canvas:
		if(IsHidingAllPolygons && main_canvas.annotations[anid].hidden) {
			main_canvas.annotations[anid].DeletePolygon();
		}
	}
}


function ChangeLinkColorFG(idx) {
	document.getElementById('Link'+idx).style.color = '#FF0000';
	var anid = main_canvas.GetAnnoIndex(idx);
	// If we're hiding all polygons, then render polygon on canvas:
	if(IsHidingAllPolygons && main_canvas.annotations[anid].hidden) {
		main_canvas.annotations[anid].DrawPolygon(main_media.GetImRatio(), main_canvas.annotations[anid].GetPtsX(), main_canvas.annotations[anid].GetPtsY());
	}
}

function HideAllPolygons() {
	if(!edit_popup_open) {
		IsHidingAllPolygons = true;
		ProgressChecking = false;

		// Delete all polygons from the canvas:
		for(var i = 0; i < main_canvas.annotations.length; i++) {
			main_canvas.annotations[i].DeletePolygon();
			main_canvas.annotations[i].hidden = true;
		}

		// Create "show all" button:
		$('#poly_held').replaceWith('<a id="hold_poly" href="javascript:ShowAllPolygons();"><b>Press to hold outlines</b></a>');
		$('#end_check_progress').replaceWith('<p style="font-size:12px;line-height:50%" id="check_progress" ><a href="javascript:CheckProgress();"><b>Check progress</b></a> (s)</p>');  
	}
	else {
		alert('Close edit popup bubble first');
	}
}

function ShowAllPolygons() {
	if (ProgressChecking) return; //hold outline setting not allowed to be trigger when progress checking ongoing
	
	// Set global variable:
	IsHidingAllPolygons = false;
	ProgressChecking = false;

	// Render the annotations:
	main_canvas.UnhideAllAnnotations();
	main_canvas.RenderAnnotations();

	// swap hold poly with poly held
	$('#hold_poly').replaceWith('<a id="poly_held" style="text-decoration:none; font-style:italic; color:#708090;">Outlines held (\'Hide all\' to release)</a>');
}


function CheckProgress() {
	ProgressChecking = true;
	
	//clear all polygons first
	if(!edit_popup_open) {
		// Delete all polygons from the canvas:
		for(var i = 0; i < main_canvas.annotations.length; i++) {
			main_canvas.annotations[i].DeletePolygon();
			main_canvas.annotations[i].hidden = true;
		}
	}
	else {
		alert('Close edit popup bubble first');
	}
	
	//reset annotations to take into account user editting labels while checking progress.
	main_canvas.annotations.length = 0;
	  // Attach valid annotations to the main_canvas:
	  for(var pp = 0; pp < LMnumberOfObjects(LM_xml); pp++) {
	      // Attach to main_canvas:
	      main_canvas.AttachAnnotation(new annotation(pp));
	      if (!video_mode && LMgetObjectField(LM_xml, pp, 'x') == null){
	        main_canvas.annotations[main_canvas.annotations.length -1].SetType(1);
	        main_canvas.annotations[main_canvas.annotations.length -1].scribble = new scribble(pp);
	      }    
	  }

	// Render the annotations:
	main_canvas.UnhideAllAnnotations();
	main_canvas.RenderAnnotations();

	//Fill all
	for (var i= 0; i < LMnumberOfObjects(LM_xml); i++){
		main_canvas.annotations[i].FillPolygon();
	}
	
	console.log("check progress");

	// Create "hide all" button:
	$('#show_all_filled_button').replaceWith('<a id="hide_all_filled_button" href="javascript:HideAllFilled();">Hide back</a>');
	$('#check_progress').replaceWith('<p style="font-size:12px;line-height:50%" id="end_check_progress"><a href="javascript:EndCheckProgress();" style="color:red"><b>Clear progress check</b></a> (h)</p>');

}

function EndCheckProgress() {
	if(!edit_popup_open) {
		ProgressChecking = false;

		if(IsHidingAllPolygons){
			// Delete all polygons from the canvas:
			for(var i = 0; i < main_canvas.annotations.length; i++) {
				main_canvas.annotations[i].DeletePolygon();
				main_canvas.annotations[i].hidden = true;
			}
		}
		else {//if we are holding all polygons
			for(var i = 0; i < main_canvas.annotations.length; i++) {
				main_canvas.annotations[i].UnfillPolygon();
			}
		}

		console.log("end check progress");
		
		// Create "show all" button:
		$('#end_check_progress').replaceWith('<p style="font-size:12px;line-height:50%" id="check_progress" ><a href="javascript:CheckProgress();"><b>Check progress</b></a> (s)</p>');
	}
	else {
		alert('Close edit popup bubble first');
	}
}


//*******************************************
//Private functions:
//*******************************************

//DRAG FUNCTIONS

function drag(event, part_id) {
	// stores the object id in the data that is being dragged.
	event.dataTransfer.setData("Text", part_id);
}

function dragend(event, object_id) {
	event.preventDefault();

	// Write XML to server:
	WriteXML(SubmitXmlUrl,LM_xml,function(){return;});
}

function dragEnter(event) {
	event.preventDefault();
	return true;
}

function dragOver(event) {
	event.preventDefault();
}

function drop(event, object_id) {
	event.preventDefault();
	var part_id=event.dataTransfer.getData("Text");
	event.stopPropagation();

	// modify part structure
	if(object_id!=part_id) {
		addPart(object_id, part_id);

		// redraw object list
		RenderObjectList();
	}
}
