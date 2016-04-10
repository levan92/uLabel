function [img, seg, names, counts] = uLSegment(imstruct, segsize, HOMEIMAGES, HOMEULSEGMENTS, HOMEMASK,loadonly)
% Transforms all the labels into a segmentated 2D matrix.
%
% imstruct : image struct variable
% imagesize : [height(row), width(col)] (if [], takes on size of image)
% loadonly: 0 = normal, 1 = only load the .mat file
% capitalised inputs: all the directories

if nargin==6
    if (length(imstruct) == 1 && loadonly == 1)
        fileseg = fullfile(HOMEULSEGMENTS, imstruct(1).annotation.folder, [imstruct(1).annotation.filename(1:end-4) '.mat']);
        % read the image and return
        if exist(fileseg, 'file')
            disp('.mat file exists!')
            load(fileseg)
            seg = S;
            img = [];
            disp('returning..')
            return
        end
    end
    if isempty(segsize)
        info = imfinfo(fullfile(HOMEIMAGES, imstruct.annotation.folder, imstruct.annotation.filename));
        segsize = [info.Height, info.Width];
    end
end

Nimages = length(imstruct);

% Create list of objects:
n=0;
while 1
    n=n+1;
    if n >length(imstruct)
        [imstruct, names, counts] = LMcreateObjectIndexField(imstruct);
        break
    end
    
    if isfield(imstruct(n).annotation, 'object')
        if ~isfield(imstruct(n).annotation.object, 'namendx')
            [imstruct, names, counts] = LMcreateObjectIndexField(imstruct);
        else
            [names, counts, imagendx, objectndx, objclass_ndx] = LMobjectnames(imstruct, 'name');
        end
        break
    end
end

Nobjectclasses = length(names);

if nargout>0
    if Nimages > 1
        % Initalize output variables
        seg = zeros([segsize(1) segsize(2) Nimages], 'uint16');
        img = zeros([segsize(1) segsize(2) 3 Nimages], 'uint8');
    end
end

if Nimages > 1
    figure
end

for ndx = 1:Nimages
    % Load image
    imgtmp = LMimread(imstruct, ndx, HOMEIMAGES);
    annotation = imstruct(ndx).annotation;
    if size(imgtmp,3)==1; imgtmp = repmat(imgtmp, [1 1 3]); end
    [nrows, ncols, cc] = size(imgtmp);
    
    % Scale image so that image box fits tight in image
    if ~isempty(segsize)
        scaling = max(segsize(1)/nrows, segsize(2)/ncols);
        [annotationtmp, imgtmp] = LMimscale(annotation, imgtmp, scaling, 'bicubic');
        
        % Crop image to final size
        [nr nc cc] = size(imgtmp);
        sr = floor((nr-segsize(1))/2);
        sc = floor((nc-segsize(2))/2);
        [annotationtmp, imgtmp] = LMimcrop(annotationtmp, imgtmp, [sc+1 sc+segsize(2) sr+1 sr+segsize(1)]);
        
        Mclasses = zeros([segsize(1) segsize(2)]);
    else
        annotationtmp = annotation;
        Mclasses = zeros([size(imgtmp,1) size(imgtmp,2)]);
    end
    
    if isfield(annotationtmp, 'object')                
        % Get segmentation
        [S_instances, ~] = uLObjectMask(annotationtmp, size(imgtmp), HOMEMASK);
        classesndx = [annotationtmp.object.namendx];
        area = squeeze(sum(sum(S_instances,1),2));
        
        j = find(area>2); % remove small objects
        S_instances = S_instances(:,:,j);
        classesndx = classesndx(j);
        
        % Assign labels taking into account occlusions!
        for k = size(S_instances,3):-1:1;
            S_instances(:,:,k) = classesndx(k)*S_instances(:,:,k);
            Mclasses = Mclasses+(Mclasses==0).*S_instances(:,:,k);
        end
    end
    
    if nargout>0
        % Store values
        seg(:,:,ndx)   = uint16(Mclasses);
        img(:,:,:,ndx) = imgtmp;    
    end
    
%     %% Save in a .mat file
%         I = imgtmp;
%         S = uint16(Mclasses);
%         S_instances = uint16(S_instances);
%         folderseg = fullfile(HOMEULSEGMENTS, imstruct(ndx).annotation.folder);
%         if (~exist(folderseg,'dir'))
%             mkdir(folderseg);
%         end
%         fileseg = fullfile(folderseg, [imstruct(ndx).annotation.filename(1:end-4) '.mat']);
%         if ~isempty(segsize)
%             save (fileseg, 'I', 'S', 'names', 'S_instances')
%         else
%             save (fileseg, 'S', 'names', 'S_instances')
%         end
    
%     %% Visualization
%     if Nimages > 1
%         subplot(121)
%         image(imgtmp); axis('equal'); axis('tight');
%         title(sprintf('%d (out of %d)', ndx, Nimages))
%         subplot(122)
%         image(mod(Mclasses+1,256)); axis('equal'); axis('tight');
%         colormap([0 0 0; hsv(min(Nobjectclasses+1,256))])
%         drawnow
%     end
end

