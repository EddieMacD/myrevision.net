# myrevision.net

== Main configuration ==

Main site configuration and details such as menus and footers are in:
 config.toml

The content of pages is controlled by plain text "data" files in 
  /data/en/
e.g. homepage is controlled by /data/en/homepage.yml





== Static content ==

Images are stored in:
  /static/images

Anything stored in /static will be available from the domain root. For example if you wanted to store a pdf for people to download, you would place it in:
  /static/dowloads/example.pdf
the URL would then be
  https://myrevision.net/downloads/example.pdf


== Technical details == 

Page markdown parameters are provided by:
  /content/english/<pagename>/index.md

Markdown content is *not* rendered, content is provided from /data/* files 
as defined by layouts from /themes/airspace-hugo/layouts/<pagename>/list.html

Other information can be found at [myrevision.net/links](https://myrevision.net/links)
