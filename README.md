[uLabel](http://ec2-52-76-218-133.ap-southeast-1.compute.amazonaws.com/ulabel/tool.html?folder=nus_engin&image=nusEngin00001.jpg) annotation tool source code
===========

### CONTENTS:

* Images - This is where your images go.
* Annotations - This is where the annotations are collected.
* Masks - This is where the segmentation masks are collected (scribble mode).
* Scribbles - This is where the scribbles are collected (scribble mode).
* tool.html - Main web page for uLabel annotation tool.
* annotationTools - Directory with source code.
* annotationCache - Location of temporary files.
* Icons - Icons used on web page.
* matlab toolbox - MATLAB scripts for post-processing.
* LabelsForTraining - Output folder for the MATLAB post-processing script on XML annotations

* train.bat - (NOT NEEDED if not training for scene parsing algorithm) The batch file that runs on Windows system, to parse XML files to indexed label text files, which are then pass into the scene parsing training algorithm and saved to the model data folder of the scene parsing algorithm. Run train.bat file with an input argument of the folder name to train. For e.g.: >> train nus_engin

### QUICK START INSTRUCTIONS:

1. Put entire code on web server (see web server
   configuration requirements below).

2. On the command line run:

   ``` sh
   $ make
   ```

   This will set a global variable that the perl scripts
   need.  ***Note*** If you move the location of the code, then you
   need to re-run "make" to refresh the global variable.

3. Create a subfolder inside the "Images" folder and place your images
   there.  For example: "Images/example_folder/img1.jpg".  Make sure
   all of your images have a ".jpg" extension and the
   folders/filenames have alphanumeric characters (i.e. no spaces or
   funny characters).

4. Point your web browser to the following URL: 

   http://www.yourserver.edu/path/to/uLabel/tool.html?&folder=some_folder&image=img1.jpg

5. Label your image.

6. Your annotations will appear inside of the "Annotations" folder.

### WEB SERVER REQUIREMENTS:

You will need the following to set up the uLabel tool on your web
server:

* Run an Apache server (see special configuration instructions for
  [Ubuntu](UBUNTU.md) or [Windows](WINDOWS.md)).
* Enable authconfig in Apache so that server side includes (SSI) will
  work. This will allow SVG drawing capabilities. This is the most
  common source of errors, so make sure this step is working.
 
* Allow perl/CGI scripts to run.  This is the second most common
  source of errors.
 
* Make sure the php5 and libapache2-mod-php5 libraries are
  installed. You can install them on Linux by running the following:

   ``` sh
   $ sudo apt-get install php5 libapache2-mod-php5
   ```
   
If you are not able to draw polygons, check to see if the page is
loaded as an "application/xhtml+xml" page (you can see this in
Firefox by navigating to Tools->Page Info). If it is not, be sure
that SSI are enabled (see above for enabling authconfig in Apache).

Make sure that your images have read permissions on your web server
and folders in the "Annotations" folder have write permissions. Also,
"annotationCache/TmpAnnotations" needs to have write permissions.

===========
Adapted from LabelMe: B. C. Russell, A. Torralba, K. P. Murphy, and W. T. Freeman, "LabelMe: A Database and Web-Based Tool for Image Annotation," International Journal of Computer Vision, vol. 77, pp. 157-173, 2007.
