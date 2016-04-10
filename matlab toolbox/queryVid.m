videoPath='/Users/lingevan/Desktop/FYP/training annotation/NUS engin videos/nusEngin5thApril00012.m4v'; 
storePath =  '/Library/WebServer/Documents/ulabel/Images/nus_engin/nusEngin14';

xyloObj = VideoReader(videoPath);

len = xyloObj.NumberOfFrames

numFramesExtracted =  3

frame_interval = ceil(len / numFramesExtracted)
