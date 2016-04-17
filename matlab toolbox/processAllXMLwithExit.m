function processAllXMLwithExit(folder)
cd 'C:\Program Files (x86)\Apache Software Foundation\Apache2.2\htdocs\ulabel\matlab toolbox'
%% For processing and outputing to text files for a group of XML labels in a folder
%% collection name (folder)
%change accordingly
%%folder = 'nus_engin';
%% root folders declarations
HOME = 'C:\Program Files (x86)\Apache Software Foundation\Apache2.2\htdocs\ulabel';
HOMEANNOTATIONS = fullfile (HOME, 'Annotations');
HOMEIMAGES = fullfile (HOME, 'Images');
HOMEMASK = fullfile (HOME, 'Masks');
HOMEULSEGMENTS = fullfile (HOME, 'Segments');
HOMELABELS = fullfile (HOME, 'LabelsForTraining');
%% loop through folder to process xmls
xmlFNs = fullfile (HOMEANNOTATIONS, folder, '*.xml');
xmlFiles = dir (xmlFNs);
for xmlFile = xmlFiles'
    %get full path of xml
    xmlFN = fullfile (HOMEANNOTATIONS, folder, xmlFile.name);
    %extract name
    [~,imgname,~] = fileparts(xmlFile.name);
    % running functions
    [imgstruct, img1xml] = loadXML(xmlFN);
    [img, seg, names, counts] = uLSegment(imgstruct, [], HOMEIMAGES, HOMEULSEGMENTS, HOMEMASK, 0);
    % writing seg to pixel-indexed label text file
    labelFN = writeLabelTxt (HOMELABELS, imgname, folder, seg, names);
    display (['Processed and wrote label txt file for ', xmlFile.name]);
end
exit;
end
