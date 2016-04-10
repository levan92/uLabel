%% For processing, and outputing to text file for a specific XML label
%% image name (without .ext) & collection name (folder)
%change accordingly
imgname = 'biopolis4';
folder = 'training1';
%% root folders declarations
HOMEANNOTATIONS = '/Library/WebServer/Documents/ulabel/Annotations';
HOMEIMAGES = '/Library/WebServer/Documents/ulabel/Images';
HOMEMASK = '/Library/WebServer/Documents/ulabel/Masks';
HOMEULSEGMENTS = '/Library/WebServer/Documents/ulabel/Segments';
HOMELABELS = '/Library/WebServer/Documents/ulabel/LabelsForTraining';
%% running functions
filename = fullfile (HOMEANNOTATIONS,folder, strcat(imgname,'.xml'));
if exist(filename,'file')
    [imgstruct, img1xml] = loadXML(filename);
    [img, seg, names, counts] = uLSegment(imgstruct, [], HOMEIMAGES, HOMEULSEGMENTS, HOMEMASK, 0);
%% writing seg to pixel-indexed label text file
    labelFN = writeLabelTxt (HOMELABELS, imgname, folder, seg, names);
else
    display ([strcat(imgname,'.xml') ' does not exist']);
end