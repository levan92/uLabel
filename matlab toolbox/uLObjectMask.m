function [mask, class, maskpol, classpol] = uLObjectMask(annotation, segsize, HOMEMASK)
% Returns a segmentation mask for all the objects in the annotation struct
% This function  generates segmentation masks for all
% the annotated objects in the order that they are present. Multiple
% intances of the same object also get separated masks.
%
% annotation : image struct
% segsize: [height row] setting it to [] takes the image's size as masks' size
% HOMEMASK: home dir for mask files
%
maskpol = []; classpol = [];
%% wrong inputs
if nargin ~= 3
    if nargin < 3
        error('Not enough input arguments.')
    else if nargin > 3
            error ('Too much input arguments.')
        end
    end
end

%% correct inputs
if isempty(segsize)
    info = imfinfo(fullfile(HOMEIMAGES, annotation.folder, annotation.filename));
    nrows = info.Height;
    ncols = info.Width;
else
    nrows = segsize(1); %height
    ncols = segsize(2); %width
end

% if a list is not specified it generates segmentation masks for all
% the annotated objects in the order that they are present. Multiple
% intances of the same object also get separated masks.
class = []; mask = [];
if isfield(annotation, 'object')
    Nobjects = length(annotation.object);
    %[x,y] = meshgrid(1:ncols,1:nrows);
    
    mask = zeros([nrows, ncols, Nobjects]);
    for i = 1:Nobjects
        class{i} = annotation.object(i).name; % get object name
        if (~isempty(annotation.object(i).polygon.x))
            [X,Y] = getLMpolygon(annotation.object(i).polygon);
            mask(:,:,i) = poly2mask(double(X),double(Y),nrows,ncols);
        else %class is a scribble
            BW = getScribbleMask(annotation.object(i), HOMEMASK, annotation.folder);
            mask(:,:,i) = BW;
        end
    end
end

if nargout ==0;
    seg = colorSegments(mask);
    imshow(seg);
end

