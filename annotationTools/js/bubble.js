
/** @file This file contains functions that draw the popup bubble during labeling 
 * or editing an object. */
//*******************************************
//Public methods:
//*******************************************
/** This function creates the popup bubble.  
 * @param {float} left - xlocation of the bubble
 * @param {float} top - ylocation of the bubble
 * @param {string} innerhtml - extra html content for the bubble
 * @param {string} dom_attach - id of the html element where it should be attached
 * @returns {string} bubble_name - dom element name for the popup bubble
 */
var part_bubble;

function CreatePopupBubble(left, top, innerHTML, dom_attach) {
	var html_str;
	var bubble_name = 'myPopup';

	// Adjust location to account for the displacement of the arrow:
	left -= 22;
	if (left < 5) left = 5;

	// Select the vertical position of the bubble decoration arrow
	if (top > 214) {
		html_str = '<div class= "bubble" id="' + bubble_name + '" style="position:absolute;z-index:5; left:' + left + 'px; top:' + top + 'px;">';
	} else {
		html_str = '<div class= "bubble top" id="' + bubble_name + '" style="position:absolute;z-index:5; left:' + left + 'px; top:' + top + 'px;">';
	}

	// Insert bubble inner contents:
	html_str += innerHTML;

	// Close div tag:
	html_str += '</div>';

	// Insert bubble into the DOM tree:
	$('#' + dom_attach).append(html_str);

	// Place bubble in the right location taking into account the rendered size and the location of the arrow
	if (top > 214) {
		h = $('#' + bubble_name).height();
		document.getElementById(bubble_name).style.top = (top - h - 80) + 'px';
	} else {
		document.getElementById(bubble_name).style.top = (top) + 'px';
	}
	setTimeout("$('#objEnter').focus();", 1);
	return bubble_name;
}

/** This function creates the close button at the top-right corner of the popup bubble
 * @param {string} dom_bubble - dom_bubble name
 * @param {function} close_button - function to run when the close button is pressed
 */
function CreatePopupBubbleCloseButton(dom_bubble, close_function) {
	if (arguments.length == 1) {
		close_function = function() {
			return;
		};
	}
	var html_str = '<img id="' + dom_bubble + '_closebutton" style="border: 0pt none; width:14px; height:14px; z-index:4; -moz-user-select:none; position:absolute; cursor:pointer; right:8px; top: 8px;" src="Icons/close.png" height="14" width="14" />';
	$('#' + dom_bubble).append(html_str);
	$('#' + dom_bubble + '_closebutton').mousedown(function() {
		$('#' + dom_bubble).remove();
		close_function();
		return;
	});
}


//*******************************************
//All functions below here need to be moved to their appropriate module:
//*******************************************

//THINGS THAT WILL BE GOOD TO SIMPLIFY:
//1- why are there two functions -almost-identical- to close the bubble?
//2- why is different the way the data is submitted in edit and query? I think with LM_xml data handling this will be simplified.
//3- I want functions
//LM_xml.store(obj_index, fieldname, value)
//LM_xml.getvalue(obj_index, fieldname)
//LM_xml.sendtoserver


//Query popup bubble:
function mkPopup(left, top, scribble_popup) {
	wait_for_input = 1;
	var innerHTML = GetPopupFormDraw(scribble_popup);
	CreatePopupBubble(left, top, innerHTML, 'main_section');

	// Focus the cursor inside the box
	setTimeout("$('#objEnter').focus();", 1);
}

function mkEditPopup(left, top, anno) {
	edit_popup_open = 1;
	var innerHTML = GetPopupFormEdit(anno);
	var dom_bubble = CreatePopupBubble(left, top, innerHTML, 'main_section');
	CreatePopupBubbleCloseButton(dom_bubble, StopEditEvent);
	
	//esc key shortcut to close edit bubble
	$('#objEnter').bind('keydown.esc', function(){if (edit_popup_open) StopEditEvent();});

	// Focus the cursor inside the box
	$('#objEnter').select();
	$('#objEnter').focus();
}

function CloseQueryPopup() {
	wait_for_input = 0;
	$('#myPopup').remove();
}

function CloseEditPopup() {
	edit_popup_open = 0;
	$('#myPopup').remove();
}

//****************************
//Forms:
//****************************

function GetPopupFormDraw(scribble_form) {
	wait_for_input = 1;
	html_str = "<b>What is this?</b><br />";
	html_str += HTMLobjectBox("",scribble_form);

	// Done button:
	html_str += '<input type="button" value="Done(d)" title="Press this button after you have provided all the information you want about the object." onclick="main_handler.SubmitQuery();" tabindex="0" />';

	// Undo close button/Keep editting
	if (!scribble_form) {
		if (!bounding_box) 
			html_str += '<input type="button" value="Opps(z)" title="Press this button if you accidentally closed the polygon. You can continue adding control points." onclick="UndoCloseButton();" tabindex="0" />';
	}
	else html_str += '<input type="button" value="Opps(z)" title="Press this button if to keep adding scribbles." onclick="KeepEditingScribbles();" tabindex="0" />';

	// Delete button:
	html_str += '<input type="button" value="Delete(`)" title="Press this button if you wish to delete the polygon." onclick="main_handler.WhatIsThisObjectDeleteButton();" tabindex="0" />';

	return html_str;
}

function GetPopupFormEdit(anno) {
	// get object name and attributes from 'anno'
	edit_popup_open = 1;
	part_bubble = false;
	var obj_name = LMgetObjectField(LM_xml, anno.anno_id, 'name');
	if (obj_name == "") obj_name = "?";

	html_str = "<b>Enter object name</b><br />";
	// Scribble: if anno.GetType() != 0 then scribble mode:
	var isScribbles = (anno.GetType() != 0);
	html_str += HTMLobjectBox(obj_name, isScribbles);

	html_str += '<input type="button" value="Done" title="Press this button when you are done editing." onclick="main_handler.SubmitEditLabel();" tabindex="0" />';

	/*************************************************************/
	/*************************************************************/

	// Adjust polygon button:
	if (!isScribbles) {
		html_str += '<input type="button" value="Adjust polygon" title="Press this button if you wish to update the polygon\'s control points." onclick="javascript:AdjustPolygonButton();" />';
	} else {
		html_str += '<input type="button" value="Edit Scribbles" title="Press this button if you wish to update the segmentation." onclick="javascript:EditBubbleEditScribble();" />';
	}
	/*************************************************************/
	/*************************************************************/

	// Delete button:
	html_str += '<input type="button" value="Delete" title="Press this button if you wish to delete the polygon." onclick="main_handler.EditBubbleDeleteButton();" tabindex="0" />';

	return html_str;
}

//****************************
//Simple building blocks:
//****************************

//Shows the box to enter the object name
function HTMLobjectBox(obj_name, isScribbles) {
	var html_str = "";
	html_str += '<select name = "objEnter" id = "objEnter" style="width:150px;"'+   
	' onkeyup="var c;'+
	'if(event.keyCode) c=event.keyCode;'+
	'if(event.which) c=event.which;';

	// if obj_name is empty it means that the box is being created
	if (obj_name == ''){
		//if enter or d key pressed, submit query
		html_str += 'if(c==13||c==68) main_handler.SubmitQuery();'+
		//if ` key pressed, delete polygon entry
		'if(c==192) main_handler.WhatIsThisObjectDeleteButton();';
		if (!isScribbles){
			if(!bounding_box){
				//if z pressed, undo query and resume polygon drawing
				html_str += 'if(c==90) UndoCloseButton();">';}
			else{
				//close html_str for bounding box case
				html_str += '">';
			}
			}
		else
			//if z pressed, undo query and resume editting scribbles
			html_str += 'if(c==90) KeepEditingScribbles();">';
	}
	else //edit mode 
	{
		
		//if enter or d key pressed, submit query 
		html_str += 'if(c==13||c==68) main_handler.SubmitEditLabel();'+
		//if ` key pressed, delete polygon entry
		'if(c==192) main_handler.EditBubbleDeleteButton();';

		if (!isScribbles)
			//if z pressed, undo query and resume polygon drawing
			html_str += 'if(c==90) AdjustPolygonButton();">';
		else
			//if z pressed, undo query and resume editting scribbles
			html_str += 'if(c==90) EditBubbleEditScribble();">';
	}

	//Fixed list of classes to choose from
	html_str += '<option value="Sky">Sky</option>' +
	'<option value="Road">Road</option>'+
	'<option value="WhiteLine">White Road Marking</option>' +
	'<option value="YellowLine">Yellow Road Marking</option>' +
	'<option value="Kerb">Kerb</option>'+
	'<option value="Pavement">Pavement</option>'+
	'<option value="LowVeg">Low Vegetation</option>'+
	'<option value="HighVeg">High Vegetation</option>'+
	'<option value="TreeTrunk">Tree Trunk</option>' +
	'<option value="Building">Building</option>'+
	'<option value="Object">Object</option>'+
	'<option value="Pole">Pole</option> </select>';

	html_str += '<br />';

	return html_str;
}

//****************************
//ATTRIBUTES:
//****************************
//?attributes=object:car;brand:seat/ford;color:...;comments:...

//is the object occluded?
/*function HTMLoccludedBox(occluded) {
    var html_str = "";

    // by default, the value of occluded is "no"
    if (!(occluded == "no" || occluded == "yes")) {
        occluded = "no";
    }

    // the value of the selection is inside a hidden field:
    html_str += 'Is occluded? <input type="hidden" name="occluded" id="occluded" value="' + occluded + '"/>';

    // generate radio button
    if (occluded == 'yes') {
        html_str += '<input type="radio" name="rboccluded" id="rboccluded" value="yes" checked="yes" onclick="document.getElementById(\'occluded\').value=\'yes\';" />yes';
        html_str += '<input type="radio" name="rboccluded" id="rboccluded" value="no"  onclick="document.getElementById(\'occluded\').value=\'no\';" />no';
    } else {
        html_str += '<input type="radio" name="rboccluded" id="rboccluded" value="yes"  onclick="document.getElementById(\'occluded\').value=\'yes\';" />yes';
        html_str += '<input type="radio" name="rboccluded" id="rboccluded" value="no" checked="yes"  onclick="document.getElementById(\'occluded\').value=\'no\';" />no';
    }
    html_str += '<br />';

    return html_str;
}*/

//Boxes to enter attributes
/*function HTMLattributesBox(attList) {
    return '<textarea name="attributes" id="attributes" type="text" style="width:260px; height:3em;" tabindex="0" title="Enter a comma separated list of attributes, adjectives or other object properties">' + attList + '</textarea>';
}*/


//****************************
//PARTS:
//****************************
/*function HTMLpartsBox(parts) {
    var html_str = "";
    if (parts.length > 0) {
        if (parts.length == 1) {
            html_str = 'Object has 1 part.';
        } else {
            html_str = 'Object has ' + parts.length + ' parts.';
        }
    } else {
        html_str = 'Object has no parts.';
    }

    return html_str;
}*/