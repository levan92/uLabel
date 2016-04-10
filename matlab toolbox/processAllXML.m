cd '/Users/lingevan/Desktop/FYP/training annotation/matlab toolbox'
%% For processing and outputing to text files for a group of XML labels in a folder
%% collection name (folder)
%change accordingly
folder = 'training1';
%% root folders declarations
HOMEANNOTATIONS = '/Library/WebServer/Documents/ulabel/Annotations';
HOMEIMAGES = '/Library/WebServer/Documents/ulabel/Images';
HOMEMASK = '/Library/WebServer/Documents/ulabel/Masks';
HOMEULSEGMENTS = '/Library/WebServer/Documents/ulabel/Segments';
HOMELABELS = '/Library/WebServer/Documents/ulabel/LabelsForTraining';
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