#Oracle APEX Dynamic Action Plugin - APEX Screen Capture
This plugin allows you to take "screenshots/captures" of pages or parts of it, directly on the users browser.
The screenshot is based on the DOM and as such may not be 100% accurate to the real representation as it does not make an actual screenshot, but builds the screenshot based on the information available on the page.

**Works best in modern browsers** [For more informations visit html2canvas](https://github.com/niklasvh/html2canvas)

##Changelog
####1.2 - Added possibility to capture part of screen with a graphical DOM selector (Choose DIV with your mouse cursor)

####1.1 - Set default width/height to browser dimensions for JQuery selectors

####1.0 - Initial Release

##Install
- Import plugin file "dynamic_action_plugin_de_danielh_apexscreencapture.sql" from source directory into your application
- (Optional) Deploy the JS files from "server" directory on your webserver and change the "File Prefix" to webservers folder.

##Plugin Settings
The plugin settings are highly customizable and you can change:
- DOM UI Selector - Choose if a graphical selector should be used or not.
- JQuery Selector - Enter the JQuery Selector that should be captured
- Open image in new tab (or save to Item) - Choose whether the image should be opened in a new tab or saved as base64 png to an APEX item
- Item Picker - Item which holds the base64 png image informations
- Background color - Canvas background color, if none is specified in DOM. Set undefined for transparent
- Width - Width in pixels (default screen width)
- Height - Height in pixels (default screen height)
- Letter rendering - Whether to render each letter separately
- Allow taint - Whether to allow cross-origin images to taint the canvas
- Logging - Whether to log events in the console

## How to use
- Create for example a new Dynamic Action with event "on button click"
- As action choose "APEX Screen Capture".
- Choose best fitting plugin attributes (help included)

If you choose to save the screenshot (data uri base64 png) to an APEX item you can use a PL/SQL function like this to convert it to BLOB:

```language-sql
CREATE OR REPLACE FUNCTION png2blob(i_clob IN CLOB) RETURN BLOB IS
  l_clob_base64 CLOB;
  l_blob        BLOB;
  --
BEGIN
  -- cut out the data uri string
  l_clob_base64 := ltrim(i_clob,
                         'data:image/png;base64,');
  -- convert base64 to blob (mimetype: image/png)
  l_blob := apex_web_service.clobbase642blob(p_clob => l_clob_base64);
  --
  RETURN l_blob;
END png2blob;
```

##Demo Application
https://apex.oracle.com/pls/apex/f?p=57743:14

##Preview
![](https://github.com/Dani3lSun/apex-plugin-apexscreencapture/blob/master/preview.gif)
---
[html2canvas](https://github.com/niklasvh/html2canvas)
[Dom Outline](https://github.com/andrewchilds/jQuery.DomOutline)