/** @file This file contains the scripts for when the edit event is activated. */


var select_anno = null;
var adjust_event = null;
/**
  * This function is called with the edit event is started.  It can be
  * triggered when the user (1) clicks a polygon, (2) clicks the object in
  * the object list, (3) deletes a verified polygon.
  * @param {int} anno_id - the id of the annotation being edited

*/
function StartEditEvent(anno_id,event) {
	  
console.log('Starting edit event...');
 
  if(event) event.stopPropagation();

  active_canvas = SELECTED_CANVAS;
  edit_popup_open = 1;
  
  // Turn off automatic flag and write to XML file:
  if(LMgetObjectField(LM_xml, anno_id, 'automatic')) {
    // Insert data for server logfile:
    var anid = main_canvas.GetAnnoIndex(anno_id);
    old_name = LMgetObjectField(LM_xml,main_canvas.annotations[anid].anno_id,'name');
    new_name = old_name;
    InsertServerLogData('cpts_not_modified');
    
    // Set <automatic> in XML:
    LMsetObjectField(LM_xml, anno_id, 'automatic', '0');
    
    // Write XML to server:
    WriteXML(SubmitXmlUrl,LM_xml,function(){return;});
  }
  
  // Move select_canvas to front:
  $('#select_canvas').css('z-index','0');
  $('#select_canvas_div').css('z-index','0');
  
  var anno = main_canvas.DetachAnnotation(anno_id);
  
  editedControlPoints = 0;
    
  if(username_flag) submit_username();
  
  select_anno = anno;
  select_anno.SetDivAttach('select_canvas');
  var pt_x, pt_y;
  pt_x = select_anno.GetPtsX();
  pt_y = select_anno.GetPtsY();
  
  FillPolygon(select_anno.DrawPolygon(main_media.GetImRatio(),pt_x,pt_y));
  
  // Get location where popup bubble will appear:
  var pt = main_media.SlideWindow(Math.round(pt_x[0]*main_media.GetImRatio()),Math.round(pt_y[0]*main_media.GetImRatio()));

  // Make edit popup appear.
  main_media.ScrollbarsOff();
  /*if(LMgetObjectField(LM_xml, anno.anno_id, 'verified')) {
    edit_popup_open = 1;
    var innerHTML = "<b>This annotation has been blocked.</b><br />";
    var dom_bubble = CreatePopupBubble(pt[0],pt[1],innerHTML,'main_section');
    CreatePopupBubbleCloseButton(dom_bubble,StopEditEvent);
  }
  else {*/
    // Set object list choices for points and lines:
    var doReset = SetObjectChoicesPointLine(anno.GetPtsX().length);
    
    // Popup edit bubble:
    console.log ("opened edit popup");
    mkEditPopup(pt[0],pt[1],anno);
    
    // If annotation is point or line, then 
    if(doReset) object_choices = '...';
  //}
}

/** This function is called when the edit event is finished.  It can be
 * triggered when the user (1) clicks the close edit bubble button, 
 * (2) zooms, (3) submits an object label in the popup bubble, 
 * (4) clicks the object in the object list, (5) presses the ESC key.
 */
function StopEditEvent() {
  // Update the global variables for the active canvas and edit popup bubble:

  active_canvas = REST_CANVAS;
  edit_popup_open = 0;
  // Move select_canvas to back:
  $('#select_canvas').css('z-index','-2');
  $('#select_canvas_div').css('z-index','-2');
  
  console.log("in stop edit event");
  console.log("progress checking = " + ProgressChecking);
  // Remove polygon from the select canvas:
  var anno = select_anno;

  select_anno.DeletePolygon();
  select_anno = null;

  // Write logfile message:
  console.log("Closed edit popup");

  // Close the edit popup bubble:
  CloseEditPopup();
  // Turn on the image scrollbars:
  main_media.ScrollbarsOn();

  // The annotation is not deleted then attach the annotation to the main_canvas:
    main_canvas.AttachAnnotation(anno);
    if(!anno.hidden) {
      anno.RenderAnnotation('rest');
    }

  // Render the object list:
  if(view_ObjList) {
    RenderObjectList();
  }
  
  if (ProgressChecking) {
	  EndCheckProgress();
	  CheckProgress();
  }
  console.log('LabelMe: Stopped edit event.');
}

/** This function is called when the edit event is finished by deletion. */
function StopEditDeleteEvent (){
	  // Update the global variables for the active canvas and edit popup bubble:

	  active_canvas = REST_CANVAS;
	  edit_popup_open = 0;
	  // Move select_canvas to back:
	  $('#select_canvas').css('z-index','-2');
	  $('#select_canvas_div').css('z-index','-2');
	  
	  // Remove polygon from the select canvas:
	  select_anno.DeletePolygon();

	  var anno = select_anno;
	  select_anno = null;

	  // Write logfile message:
	  console.log("Closed edit popup");

	  // Close the edit popup bubble:
	  CloseEditPopup();
	  // Turn on the image scrollbars:
	  main_media.ScrollbarsOn();

	  // Render the object list:
	  if(view_ObjList) {
	    RenderObjectList();
	  }
	  
	  console.log('LabelMe: Stopped edit event, deleted a label.');
}

var adjust_objEnter = '';
var adjust_attributes;
var adjust_occluded;

/** This function is called when the user clicks 'Adjust Polygon' button */
function AdjustPolygonButton() {
  // We need to capture the data before closing the bubble 
  // (THIS IS AN UGLY HACK)
  
  // Get annotation on the select canvas:
  var anno = select_anno;

  // object name
  old_name = LMgetObjectField(LM_xml,anno.anno_id,'name');
if(document.getElementById('objEnter')) 
	new_name = document.getElementById('objEnter').value;
  else 
	  new_name = adjust_objEnter;
  
  adjust_objEnter = document.getElementById('objEnter').value;
  
  // Close the edit popup bubble:
  CloseEditPopup();

  // Turn on image scrollbars:
  main_media.ScrollbarsOn();
  
  // Remove polygon from canvas:
  $('#'+anno.polygon_id).parent().remove();

  // Set to polygon drawing mode:
  SetDrawingMode(0);

  // Create adjust event:
  var frame = null;
  adjust_event = new AdjustEvent('select_canvas',LMgetObjectField(LM_xml,anno.anno_id,'x', frame),LMgetObjectField(LM_xml,anno.anno_id,'y', frame),
    LMgetObjectField(LM_xml,anno.anno_id,'name'),function(x,y,_editedControlPoints) {
      // Submit username:
      if(username_flag) submit_username();

      // Redraw polygon:
      anno.RenderAnnotation('rest');
      
      // Set polygon (x,y) points:
      if (!video_mode){
        LMsetObjectField(LM_xml, anno.anno_id, 'x', x);
        LMsetObjectField(LM_xml, anno.anno_id, 'y', y);
      }
      else {
        var slidervalues = $('#oTempBar').slider("option", "values");
        if (oVP.getcurrentFrame() >= slidervalues[0] && oVP.getcurrentFrame() <= slidervalues[1]){   
          main_media.UpdateObjectPosition(anno, x, y);
        }
      }
      

      // Set global variable whether the control points have been edited:
      editedControlPoints = _editedControlPoints;
      
      // Submit annotation:

/*      if (video_mode) main_media.SubmitEditObject();
      else*/ 
      main_handler.SubmitEditLabel();
      adjust_event = null;
    },main_media.GetImRatio(), (LMgetObjectField(LM_xml, anno.anno_id, 'type') == 'bounding_box'));

  // Start adjust event:
  adjust_event.StartEvent();
}

