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
* train.bat - batch file that runs on Windows system, to parse XML files to indexed label text files, which are then pass into the scene parsing training algorithm and saved to the model data folder of the scene parsing algorithm


===========
Adapted from LabelMe: B. C. Russell, A. Torralba, K. P. Murphy, and W. T. Freeman, "LabelMe: A Database and Web-Based Tool for Image Annotation," International Journal of Computer Vision, vol. 77, pp. 157-173, 2007.
