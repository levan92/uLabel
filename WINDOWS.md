### WINDOWS CONFIGURATION:

1. Install "Apache" for windows.

2. Install "Active Perl".

3. Install "Cygwin".  Make sure Cygwin is added to PATH (for "cp" in Windows).

4. Change the config file of Apache (httpd.conf) by adding the
   following:

   ``` sh
   # Added in line 194
   Options FollowSymLinks SymLinksIfOwnerMatch Indexes +Includes +ExecCGI
   AllowOverride AuthConfig
   AllowOverride All
   Order allow,deny
   Allow from all

   # Added in line 325
   Alias /LabelMe/ "C:/POSTDOC/LabelMe/"		

   # Added and changed (line 338)
   #ScriptAlias /cgi-bin/ "C:/Program Files/Apache Software Foundation/Apache2.2/cgi-bin/"
   ScriptAlias /cgi-bin/ "C:/POSTDOC/LabelMe/" 

   # Changed line 40
   AddHandler cgi-script .cgi .pl

   # Added and changed in line 417
   AddType text/html .shtml
   AddHandler server-parsed .shtml
   AddOutputFilter INCLUDES .shtml
   ```
   Sample httpd.conf file provided.

5. Add the module "mod_rewrite" to the Active Perl version.

6. Change all the "#! /usr/bin/.." by "#!c:/Perl/bin/perl.exe" in all
   the scripts under LabelMe.
