
/** @file Contains the file_info class, which parses the URL and
 * sets global variables based on the URL.  */
// file_info class - only works for still images at the moment
/**
 * Keeps track of the information for the currently displayed image
 * and fetches the information via dirlists or from the URL.
 * @constructor
 */
function file_info() {

    // *******************************************
    // Private variables:
    // *******************************************

    this.page_in_use = 0; // Describes if we already see an image.
    this.dir_name = null;
    this.im_name = null;
    this.collection = 'uLabel';
    this.mode = 'f'; //always f mode
    this.hitId = null;
    this.assignmentId = null;
    this.workerId = null;
    this.mt_instructions = null;

    // *******************************************
    // Public methods:
    // *******************************************

    /** Parses the URL and gets the collection, directory, and filename
     * information of the image to be annotated.  Returns true if the
     * URL has collection, directory, and filename information.
     */
    this.ParseURL = function() {
        var labelme_url = document.URL;
        var idx = labelme_url.indexOf('?');
        if ((idx != -1) && (this.page_in_use == 0)) {
            this.page_in_use = 1;
            var par_str = labelme_url.substring(idx + 1, labelme_url.length);
            var default_view_ObjList = false;
            video_mode = 0;
            do {
                idx = par_str.indexOf('&');
                var par_tag;
                if (idx == -1) par_tag = par_str;
                else par_tag = par_str.substring(0, idx);
                var par_field = this.GetURLField(par_tag);
                var par_value = this.GetURLValue(par_tag);
//                if (par_field == 'mode') {
//                    this.mode = par_value;
//                    if (this.mode == 'im' || this.mode == 'mt') view_ObjList = false;
//                }
                if (par_field == 'username') {
                    username = par_value;
                }
                if (par_field == 'collection') {
                    this.collection = par_value;
                }
                if (par_field == 'folder') {
                    this.dir_name = par_value;
                }
                if (par_field == 'image') {
                    this.im_name = par_value;
                    if (this.im_name.indexOf('.jpg') == -1 && this.im_name.indexOf('.png') == -1) {
                        this.im_name = this.im_name + '.jpg';
                    }
                }
                if (par_field == 'actions') {
                    // Get allowable actions:
                    var actions = par_value;
                    action_CreatePolygon = 0;
                    action_RenameExistingObjects = 0;
                    action_ModifyControlExistingObjects = 0;
                    action_DeleteExistingObjects = 0;
                    if (actions.indexOf('n') != -1) action_CreatePolygon = 1;
                    if (actions.indexOf('r') != -1) action_RenameExistingObjects = 1;
                    if (actions.indexOf('m') != -1) action_ModifyControlExistingObjects = 1;
                    if (actions.indexOf('d') != -1) action_DeleteExistingObjects = 1;
                    if (actions.indexOf('a') != -1) {
                        action_CreatePolygon = 1;
                        action_RenameExistingObjects = 1;
                        action_ModifyControlExistingObjects = 1;
                        action_DeleteExistingObjects = 1;
                    }
                    if (actions.indexOf('v') != -1) {
                        action_CreatePolygon = 0;
                        action_RenameExistingObjects = 0;
                        action_ModifyControlExistingObjects = 0;
                        action_DeleteExistingObjects = 0;
                    }
                }
                if (par_field == 'viewobj') {
                    // Get option for which polygons to see:
                    var viewobj = par_value;
                    view_Existing = 0;
                    view_Deleted = 0;
                    if (viewobj.indexOf('e') != -1) view_Existing = 1;
                    if (viewobj.indexOf('d') != -1) view_Deleted = 1;
                    if (viewobj.indexOf('a') != -1) {
                        view_Deleted = 1;
                        view_Existing = 1;
                    }
                }
                if (par_field == 'objlist') {
                    if (par_value == 'visible') {
                        view_ObjList = true;
                        default_view_ObjList = true;
                    }
                    if (par_value == 'hidden') {
                        view_ObjList = false;
                        default_view_ObjList = false;
                    }
                }
                if (par_field == 'objects') {
                    // Set drop-down list of object to label:
                    object_choices = par_value.replace('_', ' ');
                    object_choices = object_choices.split(/,/);
                }
                if ((par_field == 'scribble') && (par_value == 'true')) {
                    scribble_mode = true;
                }
                if ((par_field == 'threed') && (par_value == 'true')) {
                    threed_mode = true;
                }
                if ((par_field == 'bbox') && (par_value == 'true')) {
                    bbox_mode = true;
                }
                par_str = par_str.substring(idx + 1, par_str.length);
            } while (idx != -1);
            if ((!this.dir_name) || (!this.im_name)) return this.SetURL(labelme_url);

            document.getElementById('body').style.visibility = 'visible';
//            } else if (this.mode == 'im') {
//                var p = document.getElementById('header');
//                p.parentNode.removeChild(p);
//                var p = document.getElementById('tool_buttons');
//                p.parentNode.removeChild(p);
//                document.getElementById('body').style.visibility = 'visible';
//            } else {
//                this.mode = 'i';
//                document.getElementById('body').style.visibility = 'visible';
//            }

            if (!view_ObjList) {
                var p = document.getElementById('anno_anchor');
                p.parentNode.removeChild(p);
            }
        } else {
            return this.SetURL(labelme_url);
        }

        return 1;
    };

    /** Gets mode */
    this.GetMode = function() {
        return this.mode;
    };

    /** Gets collection name */
    this.GetCollection = function() {
        return this.collection;
    };

    /** Gets directory name */
    this.GetDirName = function() {
        return this.dir_name;
    };

    /** Gets image name */
    this.GetImName = function() {
        return this.im_name;
    };

    /** Sets image name */
    this.SetImName = function(newImName) {
        this.im_name = newImName;
    };

    /** Gets image path */
    this.GetImagePath = function() {
        return 'Images/' + this.dir_name + '/' + this.im_name;
    };

    /** Gets annotation path */
    this.GetAnnotationPath = function() {
        return 'Annotations/' + this.dir_name + '/' + this.im_name.substr(0, this.im_name.length - 4) + '.xml';
    };

    /** Gets full image name */
    this.GetFullName = function() {
        return this.dir_name + '/' + this.im_name;
    };

    /** Gets template path */
    this.GetTemplatePath = function() {
        if (!this.dir_name) return 'annotationCache/XMLTemplates/labelme.xml';
        return 'annotationCache/XMLTemplates/' + this.dir_name + '.xml';
    };

    // *******************************************
    // Private methods:
    // *******************************************

    /** String is assumed to have field=value form.  Parses string to
    return the field. */
    this.GetURLField = function(str) {
        var idx = str.indexOf('=');
        return str.substring(0, idx);
    };

    /** String is assumed to have field=value form.  Parses string to
     return the value. */
    this.GetURLValue = function(str) {
        var idx = str.indexOf('=');
        return str.substring(idx + 1, str.length);
    };

    /** Changes current URL to include collection, directory, and image
    name information.  Returns false. */
    this.SetURL = function(url) {
        this.FetchImage();

        // Get base LabelMe URL:
        var idx = url.indexOf('?');
        if (idx != -1) {
            url = url.substring(0, idx);
        }

        // Include username in URL:
        var extra_field = '';
        if (username != 'anonymous') extra_field = '&username=' + username;

        window.location = url + '?folder=' + this.dir_name + '&image=' + this.im_name + extra_field;
        return false;
    };

    this.SetThisNewURL = function() {
    	var url = document.URL;
   //     this.FetchImage();

        // Get base LabelMe URL:
        var idx = url.indexOf('?');
        if (idx != -1) {
            url = url.substring(0, idx);
        }

        // Include username in URL:
        var extra_field = '';
        if (username != 'anonymous') extra_field = '&username=' + username;

        window.location = url + '?mode=' +this.mode + '&folder=' + this.dir_name + '&image=' + this.im_name + extra_field;
        return false;
    };
    
    /** Fetch next image. */
    this.FetchImage = function() {
        var url = 'annotationTools/perl/fetch_image.cgi?mode=' + this.mode + '&folder=' + this.dir_name + '&image=' + this.im_name;
        console.log("url" + url);
        var im_req = null;
        // branch for native XMLHttpRequest object
        if (window.XMLHttpRequest) {
            im_req = new XMLHttpRequest();
            im_req.open("GET", url, false);
            im_req.send('');
        } else if (window.ActiveXObject) {
            im_req = new ActiveXObject("Microsoft.XMLHTTP");
            if (im_req) {
                im_req.open("GET", url, false);
                im_req.send('');
            }
        }
        
        if (im_req.status == 200) {
            this.dir_name = im_req.responseXML.getElementsByTagName("dir")[0].firstChild.nodeValue;
            this.im_name = im_req.responseXML.getElementsByTagName("file")[0].firstChild.nodeValue;
        } else {
            alert('Fatal: there are problems with fetch_image.cgi');
        }
    };
        
    this.PreFetchImage = function() {
        console.log('prefetching');
        path = 'Images/' + this.dir_name + '/' + this.im_name;
        var img1 = new Image();
        img1.src = path;
        img1.onload = function() {
            console.log('preloaded');
        };
    };
}