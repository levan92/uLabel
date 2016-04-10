function[BW] = getScribbleMask(object, HOMEMASK, folder)
maskname = object.segm.mask;
maskfile = fullfile(HOMEMASK,folder,maskname);
[~,~,trans] = imread(maskfile,'png'); %reading with 3 argout allows scribbles mask to be read more accurately as transparency taken into account
BW = im2bw(trans,0.5);
end
