% frame_interval = 80;

% videoPath='/Users/lingevan/Desktop/FYP/training annotation/NUS engin videos/nusEngin5thApril00002.m4v'; 

imageorder = 0;
frame_video_index = [];
frame_video_name = [];

% xyloObj = VideoReader(videoPath);

% len = xyloObj.NumberOfFrames

i = imageorder + 0;
for num =1 :frame_interval:len
    Img = read(xyloObj, num);
    i = i +1;

    i;
    imgfilename =  sprintf('%sImage_%06d.jpg',storePath,i);
    imwrite(Img, imgfilename, 'jpeg');
end
        
% save(sprintf('%sframe_video_index.mat',storePath),'frame_video_index','frame_video_name');
return;