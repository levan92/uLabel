
/** @file 
This contains the high-level commands for transitioning between the different annotation 
tool states.  They are: REST, DRAW, SELECTED, QUERY.
*/
// Handles all of the user's actions and delegates tasks to other classes.
// Also keeps track of global information.
var REST_CANVAS = 1;
var DRAW_CANVAS = 2;
var SELECTED_CANVAS = 3;
var QUERY_CANVAS = 4;

// Global variable indicating which canvas is active:
var active_canvas = REST_CANVAS;

// Check if we are in add parts mode
var add_parts_to = null;

function handler() {

    // *******************************************
    // Public methods:
    // *******************************************


    this.StartAddParts = function() {
        if (select_anno) {
            var anno_id = select_anno.anno_id;
            this.SubmitEditLabel();
            add_parts_to = anno_id;
        } else {
            var anno = this.SubmitQuery();
            add_parts_to = anno.anno_id;
        }
        $('#Link' + add_parts_to).css('font-weight', 700);
    };

    this.StopAddParts = function() {
        if (select_anno) this.SubmitEditLabel();
        else this.SubmitQuery();
        $('#Link' + add_parts_to).css('font-weight', 400);
        add_parts_to = null;
    };

    // Handles when the user presses the delete button in response to
    // the "What is this object?" popup bubble.
    this.WhatIsThisObjectDeleteButton = function() {
        submission_edited = 0;
        this.QueryToRest();
        if (scribble_canvas.scribblecanvas) scribble_canvas.cleanscribbles();
    };

    // Submits the object label in response to the edit/delete popup bubble.
    this.SubmitEditLabel = function() {

        if (scribble_canvas.scribblecanvas) {
            scribble_canvas.annotationid = -1;
            scribble_canvas.cleanscribbles();
        }
        submission_edited = 1;
        var anno = select_anno;

        // object name
        old_name = LMgetObjectField(LM_xml,anno.anno_id,'name');
        if(document.getElementById('objEnter')) 
        	new_name = document.getElementById('objEnter').value;
        else 
        	new_name = adjust_objEnter;

        StopEditEvent();

        // Insert data to write to logfile:
        if (editedControlPoints) InsertServerLogData('cpts_modified');
        else InsertServerLogData('cpts_not_modified');

        // Object index:
        var obj_ndx = anno.anno_id;

        // Pointer to object:

        // Set fields:
        LMsetObjectField(LM_xml, obj_ndx, "name", new_name);
        LMsetObjectField(LM_xml, obj_ndx, "automatic", "0");

        // Write XML to server:
        WriteXML(SubmitXmlUrl, LM_xml, function() {
            return;
        });

        // Refresh object list:
        if (view_ObjList) {
            RenderObjectList();
            ChangeLinkColorFG(anno.GetAnnoID());
        }
        
        if (ProgressChecking) {
      	  EndCheckProgress();
      	  CheckProgress();
        }
    };

    // Handles when the user presses the delete button in response to
    // the edit popup bubble.
    this.EditBubbleDeleteButton = function() {
        var idx = select_anno.GetAnnoID();

        if (idx >= num_orig_anno) {
            global_count--;
        }

        submission_edited = 0;

        var annoID = select_anno.anno_id;
        // Insert data for server logfile:
        old_name = LMgetObjectField(LM_xml, annoID, 'name');
        new_name = old_name;
        console.log("Deleting object");
        InsertServerLogData('cpts_not_modified');

        //reduce all id after the object about to get deleted by 1
        var totalObjs = LMnumberOfObjects (LM_xml);
        for (var i = annoID+1; i < totalObjs; i++){
    		LMsetObjectField(LM_xml, i, "id", i-1);
    	}

        //delete the object
        var obj = $(LM_xml).children("annotation").children("object").eq(annoID);
    	obj.remove();

        // Write XML to server:
        WriteXML(SubmitXmlUrl, LM_xml, function() {return;});

        // Refresh object list:
        if (view_ObjList) RenderObjectList();
        selected_poly = -1;
        unselectObjects(); // Perhaps this should go elsewhere...
        StopEditDeleteEvent();
        if (scribble_canvas.scribblecanvas) {
            scribble_canvas.annotationid = -1;
            scribble_canvas.cleanscribbles();
        }
        
        // Reset the annotations:
        this.resetAnnotation();
  	 
        if (ProgressChecking) {
		  EndCheckProgress();
		  CheckProgress();
        }
    };
    
    this.resetAnnotation = function() {
    	  
    	  console.time('reseting annotation..');

    	  //removes all exisiting polygon
    	  main_canvas.annotations.forEach ( function (anno){
    		 anno.DeletePolygon(); 
    	  });
    	  //refreshes annotations array
    	  main_canvas.annotations = Array();
    	  
    	  // Reattach valid annotations to the main_canvas:
    	  for(var pp = 0; pp < LMnumberOfObjects(LM_xml); pp++) {
    	      // Attach to main_canvas:
    	      main_canvas.AttachAnnotation(new annotation(pp));
    	      if (!video_mode && LMgetObjectField(LM_xml, pp, 'x') == null){
    	        main_canvas.annotations[main_canvas.annotations.length -1].SetType(1);
    	        main_canvas.annotations[main_canvas.annotations.length -1].scribble = new scribble(pp);
    	      }    
    	  }
    	  console.timeEnd('reattaching');

    	  console.log('rendering annotations');
    	  // Render the annotations:
    	  main_canvas.RenderAnnotations();
    	};


    // Handles when the user clicks on the link for an annotation.
    	this.AnnotationLinkClick = function(idx) {
    		if (adjust_event) return;
    		if (!ProgressChecking) {
    			if (active_canvas == REST_CANVAS) StartEditEvent(idx, null);
    			else if (active_canvas == SELECTED_CANVAS) {
    				var anno_id = select_anno.GetAnnoID();
    				if (edit_popup_open) {
    					
    					StopEditEvent();
    					ChangeLinkColorBG(idx);
    				}
    				if (idx != anno_id) {
    					ChangeLinkColorFG(idx);
    					StartEditEvent(idx, null);
    				}
    			}
    		}
    	};

    // Handles when the user moves the mouse over an annotation link.
    this.AnnotationLinkMouseOver = function(a) {
     
        if (active_canvas != SELECTED_CANVAS && ProgressChecking == false) {
            console.log('selecting...');
        	selectObject(a);
        }
    };

    // Handles when the user moves the mouse away from an annotation link.
    this.AnnotationLinkMouseOut = function() {

        if (active_canvas != SELECTED_CANVAS && ProgressChecking == false) {
            unselectObjects();
        }
    };

    // Handles when the user moves the mouse over a polygon on the drawing
    // canvas.
    this.CanvasMouseMove = function(event, pp) {
    	var x = GetEventPosX(event);
    	var y = GetEventPosY(event);
    	if (!ProgressChecking){
    		if (IsNearPolygon(x, y, pp)) selectObject(pp);
    		else unselectObjects();
    	}
    };

    // Submits the object label in response to the "What is this object?"
    // popup bubble. THIS FUNCTION IS A MESS!!!!
    this.SubmitQuery = function() {
        var nn;
        var anno;

        nn = document.getElementById('objEnter').value;
        anno = this.QueryToRest();
        
        // Update old and new object names for logfile:
        new_name = nn;
        old_name = nn;

        submission_edited = 0;
        global_count++;

        // Insert data for server logfile:
        InsertServerLogData('cpts_not_modified');

        // Insert data into XML:
        var html_str = '<object>';
        html_str += '<name>' + new_name + '</name>';
       // html_str += '<deleted>0</deleted>';
        //html_str += '<verified>0</verified>';

        var ts = GetTimeStamp();
        if (ts.length == 20) html_str += '<date>' + ts + '</date>';
        html_str += '<id>' + anno.anno_id + '</id>';
        if (bounding_box) {
            html_str += '<type>';
            html_str += 'bounding_box';
            html_str += '</type>';
        }
        if (anno.GetType() == 1) //if Scribble mode
        {
            /*************************************************************/
            /*************************************************************/
            // Scribble: Add annotation to LM_xml:
            html_str += '<segm>';
            html_str += '<username>' + username + '</username>';

            html_str += '<box>';
            html_str += '<xmin>' + scribble_canvas.object_corners[0] + '</xmin>';
            html_str += '<ymin>' + scribble_canvas.object_corners[1] + '</ymin>';
            html_str += '<xmax>' + scribble_canvas.object_corners[2] + '</xmax>';
            html_str += '<ymax>' + scribble_canvas.object_corners[3] + '</ymax>';
            html_str += '</box>';

            html_str += '<mask>' + scribble_canvas.image_name + '</mask>';

            html_str += '<scribbles>';
            html_str += '<xmin>' + scribble_canvas.image_corners[0] + '</xmin>';
            html_str += '<ymin>' + scribble_canvas.image_corners[1] + '</ymin>';
            html_str += '<xmax>' + scribble_canvas.image_corners[2] + '</xmax>';
            html_str += '<ymax>' + scribble_canvas.image_corners[3] + '</ymax>';
            html_str += '<scribble_name>' + scribble_canvas.scribble_name + '</scribble_name>';
            html_str += '</scribbles>';

            html_str += '</segm>';
            html_str += '</object>';
            $(LM_xml).children("annotation").append($(html_str));
            /*************************************************************/
            /*************************************************************/
        } else { //normal polygon mode
            html_str += '<polygon>';
            html_str += '<username>' + username + '</username>';
            for (var jj = 0; jj < draw_x.length; jj++) {
                html_str += '<pt>';
                html_str += '<x>' + draw_x[jj] + '</x>';
                html_str += '<y>' + draw_y[jj] + '</y>';
                html_str += '</pt>';
            }
            html_str += '</polygon>';
            html_str += '</object>';
            $(LM_xml).children("annotation").append($(html_str));
        }


        //if (!LMgetObjectField(LM_xml, LMnumberOfObjects(LM_xml) - 1, 'deleted') || view_Deleted) {
            main_canvas.AttachAnnotation(anno);
            anno.RenderAnnotation('rest');
        //}

        /*************************************************************/
        /*************************************************************/
        // Scribble: Clean scribbles.
        if (anno.GetType() == 1) {
            scribble_canvas.cleanscribbles();
            scribble_canvas.scribble_image = "";
            scribble_canvas.colorseg = Math.floor(Math.random() * 14);
        }
        /*************************************************************/
        /*************************************************************/

    //    if (add_parts_to != null) addPart(add_parts_to, anno.anno_id);
     
        // Write XML to server:
        WriteXML(SubmitXmlUrl, LM_xml, function() {
            return;
        });

        if (view_ObjList) RenderObjectList();
      
        return anno;
    };

    // Handles when we wish to change from "query" to "rest".
    this.QueryToRest = function() {
        active_canvas = REST_CANVAS;

        // Move query canvas to the back:
        document.getElementById('query_canvas').style.zIndex = -2;
        document.getElementById('query_canvas_div').style.zIndex = -2;

        // Remove polygon from the query canvas:
        if (query_anno) query_anno.DeletePolygon();
        var anno = query_anno;
        query_anno = null;

        CloseQueryPopup();
        main_media.ScrollbarsOn();

        return anno;
    };

    // Handles when the user presses a key while interacting with the tool.
    this.KeyPress = function(event) {
        // Delete event: 192 - ` key
        if ((event.keyCode == 192) && !wait_for_input && !edit_popup_open && !username_flag) {
            // Determine whether we are deleting a complete or partially
            // complete polygon.
            if (!main_handler.EraseSegment()) DeleteSelectedPolygon();
        }
        // 90 - z key
        // Close edit popup if it is open.
        if (event.keyCode == 90 && edit_popup_open) StopEditEvent();
    };

    // Handles when the user erases a segment.
    this.EraseSegment = function() {
        if (draw_anno && !draw_anno.DeleteLastControlPoint()) {
            submission_edited = 0;
            StopDrawEvent();
        }
        return draw_anno;
    };

    // *******************************************
    // Private methods:
    // *******************************************

}