cd "C:\Program Files (x86)\Apache Software Foundation\Apache2.2\htdocs\ulabel\matlab toolbox"
"C:\Program Files\MATLAB\R2012a\bin\matlab.exe" -nodesktop -nosplash -nojvm -wait -nodisplay -r processAllXMLwithExit('%1')
cd "C:\Users\Administrator\SceneParsing\training"
.\sceneTrain  "C:\Program Files (x86)\Apache Software Foundation\Apache2.2\htdocs\ulabel\Images\%1"  "C:\Program Files (x86)\Apache Software Foundation\Apache2.2\htdocs\ulabel\LabelsForTraining\%1" "C:\Users\Administrator\SceneParsing\ModelData"
