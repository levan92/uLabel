%% image name (without .ext) & collection name (folder)
%change accordingly
imgname = 'biopolis1';
folder = 'training1';
%% root folders declarations
%% root folders declarations
HOME = 'C:\Program Files (x86)\Apache Software Foundation\Apache2.2\htdocs\ulabel';
HOMEANNOTATIONS = fullfile (HOME, 'Annotations');
HOMEIMAGES = fullfile (HOME, 'Images');
HOMEMASK = fullfile (HOME, 'Masks');
HOMEULSEGMENTS = fullfile (HOME, 'Segments');
HOMELABELS = fullfile (HOME, 'LabelsForTraining');
%% running functions
filename = fullfile (HOMEANNOTATIONS,folder, strcat(imgname,'.xml'));
[imgstruct, img1xml] = loadXML(filename);
[img, seg, names, counts] = uLSegment(imgstruct, [], HOMEIMAGES, HOMEULSEGMENTS, HOMEMASK, 0);
%% visualising segmented mask and image
figure;
hold on;
f1 = surf(flipud(seg),'EdgeAlpha','0'); %unlabelled pixels will be transparent (able to see image behind)
view(2); colormap(hsv);
f2 = image(flipud(img)); 
hold off;