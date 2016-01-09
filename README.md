#Oracle APEX Dynamic Action Plugin - APEX Screen Capture
This plugin allows you to take "screenshots/captures" of pages or parts of it, directly on the users browser.
The screenshot is based on the DOM and as such may not be 100% accurate to the real representation as it does not make an actual screenshot, but builds the screenshot based on the information available on the page.

**Works best in modern browsers** [For more informations visit html2canvas](https://github.com/niklasvh/html2canvas)

##Changelog
####1.6 - performance improvements(removed redundant AJAX call) / split the clob into a 30k param array (OHS 32k limit for params)

####1.5 - removed the save to item functionality / instead added a AJAX function which saves the resulting image to Database using custom PL/SQL code

####1.4 - Added options to pick a border color of your choice / fill the selector´s content with light transparent color (based on border color)

####1.3 - Added options to choose a filter of graphical DOM selector / Hide label of graphical DOM selector

####1.2 - Added possibility to capture part of screen with a graphical DOM selector (Choose DIV with your mouse cursor)

####1.1 - Set default width/height to browser dimensions for JQuery selectors

####1.0 - Initial Release

##Install
- Import plugin file "dynamic_action_plugin_de_danielh_apexscreencapture.sql" from source directory into your application
- (Optional) Deploy the JS files from "server" directory on your webserver and change the "File Prefix" to webservers folder.

##Plugin Settings
The plugin settings are highly customizable and you can change:
- **DOM UI Selector** - Choose if a graphical selector should be used or not.
- **DOM Filter** - A selector that an element should match in order to be outlined and clicked. Default is 'div'. No value means no filter is enabled and all elements would be outlined.
- **Hide Label** - Shows/Hides a label above the visual indicator. The label contains the element's name, id, class name, and dimensions.
- **Selector Border Color** - Color of the DOM selector outline
- **Selector Fill Content** - Whether the content of a selected area is filled with color or not. (30% darker than selector´s border color)
- **JQuery Selector** - Enter the JQuery Selector that should be captured
- **Open image in new tab (or save to DB)** - Choose whether the image should be opened in a new window or saved to DB using custom PL/SQL (for BLOBs)
- **PLSQL Code** - PLSQL code which saves the image to database tables or collections
- **Background color** - Canvas background color, if none is specified in DOM. Set undefined for transparent
- **Width** - Width in pixels (default screen width)
- **Height** - Height in pixels (default screen height)
- **Letter rendering** - Whether to render each letter separately
- **Allow taint** - Whether to allow cross-origin images to taint the canvas
- **Logging** - Whether to log events in the console

## How to use
- Create for example a new Dynamic Action with event "on button click"
- As action choose "APEX Screen Capture".
- Choose best fitting plugin attributes (help included)

####Convert image to BLOB in PL/SQL / save to DB
For saving the screenshot (base64 png) to DB you can use a PL/SQL function like this:

```language-sql
DECLARE
  --
  l_collection_name VARCHAR2(100);
  l_clob            CLOB;
  l_blob            BLOB;
  l_filename        VARCHAR2(100);
  l_mime_type       VARCHAR2(100);
  l_token           VARCHAR2(32000);
  --
BEGIN
  -- get defaults
  l_filename  := 'screenshot_' ||
                 to_char(SYSDATE,
                         'YYYYMMDDHH24MISS') || '.png';
  l_mime_type := 'image/png';
  -- build CLOB from f01 30k Array
  dbms_lob.createtemporary(l_clob,
                           FALSE,
                           dbms_lob.session);

  FOR i IN 1 .. apex_application.g_f01.count LOOP
    l_token := wwv_flow.g_f01(i);
  
    IF length(l_token) > 0 THEN
      dbms_lob.writeappend(l_clob,
                           length(l_token),
                           l_token);
    END IF;
  END LOOP;
  --
  -- convert base64 CLOB to BLOB (mimetype: image/png)
  l_blob := apex_web_service.clobbase642blob(p_clob => l_clob);
  --
  -- create own collection (here starts custom part (for example a Insert statement))
  -- collection name
  l_collection_name := 'SCREEN_CAPTURE';
  -- check if exist
  IF NOT
      apex_collection.collection_exists(p_collection_name => l_collection_name) THEN
    apex_collection.create_collection(l_collection_name);
  END IF;
  -- add collection member (only if BLOB not null)
  IF dbms_lob.getlength(lob_loc => l_blob) IS NOT NULL THEN
    apex_collection.add_member(p_collection_name => l_collection_name,
                               p_c001            => l_filename, -- filename
                               p_c002            => l_mime_type, -- mime_type
                               p_d001            => SYSDATE, -- date created
                               p_blob001         => l_blob); -- BLOB img content
  END IF;
  --
END;
```

####Excluding page areas from getting rendered
If you would like to exclude some areas from getting rendered to the resulting image, just add

```
data-html2canvas-ignore="true"
```

to a element or a region or something else.
If you would like to exclude a complete region add the "data-html2canvas-ignore" attribute to the "Custom Attributes" field of a region in APEX Page Designer.


##Demo Application
https://apex.oracle.com/pls/apex/f?p=APEXPLUGIN

##Preview
![](https://github.com/Dani3lSun/apex-plugin-apexscreencapture/blob/master/preview.gif)
---
- [html2canvas](https://github.com/niklasvh/html2canvas)
- [ JQuery DOM Outline](https://github.com/andrewchilds/jQuery.DomOutline)