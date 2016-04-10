#!/usr/bin/env python
# -*- coding: UTF-8 -*-

import subprocess
# enable debugging
import cgitb
cgitb.enable()


subprocess.call("matlab -nodesktop -nosplash -nojvm -nodisplay < '/Users/lingevan/Desktop/FYP/training annotation/LabelMeToolbox-master/processAllXML.m'",shell=True)
