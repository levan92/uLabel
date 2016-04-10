%% image name (without .ext) & collection name (folder)
%change accordingly
imgname = 'biopolis1';
folder = 'training1';
%% root folders declarations
HOMEANNOTATIONS = '/Library/WebServer/Documents/ulabel/Annotations';
HOMEIMAGES = '/Library/WebServer/Documents/ulabel/Images';
HOMEMASK = '/Library/WebServer/Documents/ulabel/Masks';
HOMEULSEGMENTS = '/Library/WebServer/Documents/ulabel/Segments';
HOMELABELS = '/Library/WebServer/Documents/ulabel/LabelsForTraining';
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