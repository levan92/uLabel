function labelFN = writeLabelTxt (HOMELABELS, imgname, folder, seg, names)

labelFolderDir = fullfile (HOMELABELS, folder);
if ~exist(labelFolderDir,'dir')
    mkdir (labelFolderDir);
end
labelFN = fullfile (labelFolderDir, strcat(imgname,'.txt'));

labelFile = fopen(labelFN,'w');
% making header line
[imgRow, imgCol] = size(seg);
namesTmp = sprintf('%s ' ,names{:});
namesJoined = strtrim(namesTmp);
headingLabels = [num2str(imgRow),' ',num2str(imgCol),' ',namesJoined,'\n'];
fprintf (labelFile, headingLabels);
fclose (labelFile);
% appending seg matrix
dlmwrite (labelFN, seg, '-append','delimiter',' ');
end