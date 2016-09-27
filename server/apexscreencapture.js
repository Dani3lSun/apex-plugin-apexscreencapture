// APEX Screen capture functions
// Author: Daniel Hochleitner
// Version: 1.9

// global namespace
var apexScreenCapture = {
    // parse string to boolean
    parseBoolean: function(pString) {
        var pBoolean;
        if (pString.toLowerCase() == 'true') {
            pBoolean = true;
        }
        if (pString.toLowerCase() == 'false') {
            pBoolean = false;
        }
        if (!(pString.toLowerCase() == 'true') && !(pString.toLowerCase() == 'false')) {
            pBoolean = undefined;
        }
        return pBoolean;
    },
    // builds a js array from long string
    clob2Array: function(clob, size, array) {
        loopCount = Math.floor(clob.length / size) + 1;
        for (var i = 0; i < loopCount; i++) {
            array.push(clob.slice(size * i, size * (i + 1)));
        }
        return array;
    },
    // converts DataURI to base64 string
    dataURI2base64: function(dataURI) {
        var base64 = dataURI.substr(dataURI.indexOf(',') + 1);
        return base64;
    },
    // Get Browser Name helper function
    getBrowserName: function() {
        var nVer = navigator.appVersion;
        var nAgt = navigator.userAgent;
        var browserName = navigator.appName;
        var nameOffset, verOffset, ix;

        // In Opera, the true version is after "Opera" or after "Version"
        if ((verOffset = nAgt.indexOf("Opera")) != -1) {
            browserName = "opera";
        }
        // In MSIE, the true version is after "MSIE" in userAgent
        else if ((verOffset = nAgt.indexOf("MSIE")) != -1) {
            browserName = "ie";
        } else if ((verOffset = nAgt.indexOf("Trident")) != -1) {
            browserName = "ie";
        }
        // In Edge, the true version is after "Edge"
        else if ((verOffset = nAgt.indexOf("Edge")) != -1) {
            browserName = "edge";
        }
        // In Chrome, the true version is after "Chrome"
        else if ((verOffset = nAgt.indexOf("Chrome")) != -1) {
            browserName = "chrome";
        }
        // In Safari, the true version is after "Safari" or after "Version"
        else if ((verOffset = nAgt.indexOf("Safari")) != -1) {
            browserName = "safari";
        }
        // In Firefox, the true version is after "Firefox"
        else if ((verOffset = nAgt.indexOf("Firefox")) != -1) {
            browserName = "firefox";
        }
        // In most other browsers, "name/version" is at the end of userAgent
        else if ((nameOffset = nAgt.lastIndexOf(' ') + 1) <
            (verOffset = nAgt.lastIndexOf('/'))) {
            browserName = nAgt.substring(nameOffset, verOffset);
            if (browserName.toLowerCase() == browserName.toUpperCase()) {
                browserName = navigator.appName;
            }
        }
        return browserName;
    },
    // get Image (DataURI to Tab / base64 to Apex Ajax)
    getImage: function(ajaxIdentifier, canvas, openWindow, callback) {
        var img = canvas.toDataURL("image/png");
        if (openWindow == 'Y') {
            var browserName = apexScreenCapture.getBrowserName();
            // for IE & Edge Browser (don´t support navigating to base64 data uri)
            if (browserName == 'ie' || browserName == 'edge') {
                window.navigator.msSaveBlob(canvas.msToBlob(), 'screenshot.png');
                callback();
            }
            // all other browsers
            else {
                apex.navigation.openInNewWindow(img, 'CapturedImageWindow');
                callback();
            }
        } else {
            // img DataURI to base64
            var base64 = apexScreenCapture.dataURI2base64(img);
            // split base64 clob string to f01 array length 30k
            var f01Array = [];
            f01Array = apexScreenCapture.clob2Array(base64, 30000, f01Array);
            // APEX Ajax Call
            apex.server.plugin(ajaxIdentifier, {
                f01: f01Array
            }, {
                dataType: 'html',
                // SUCESS function
                success: function() {
                    // add apex event
                    $('body').trigger('screencapture-saved-db');
                    callback();
                },
                // ERROR function
                error: function(xhr, pMessage) {
                    // add apex event
                    $('body').trigger('screencapture-error-db');
                    // logging
                    console.log('getImage: apex.server.plugin ERROR:', pMessage);
                    callback();
                }
            });
        }
    },
    // html2canvas function
    dohtml2canvas: function(phtmlElem, popenWindow, pAjaxIdentifier, pbackground, pwidth, pheight, pletterRendering, pallowTaint, plogging) {
        // Logging
        if (plogging) {
            console.log('dohtml2canvas: HTML element:', phtmlElem);
            console.log('dohtml2canvas: element width:', pwidth);
            console.log('dohtml2canvas: element height:', pheight);
        }
        // html2canvas
        html2canvas($(phtmlElem), {
            onrendered: function(canvas) {
                // wait spinner
                var lSpinner$ = apex.util.showSpinner($('body'));
                // getImage
                apexScreenCapture.getImage(pAjaxIdentifier, canvas, popenWindow, function() {
                    // remove spinner
                    lSpinner$.remove();
                });
            },
            background: pbackground,
            width: pwidth,
            height: pheight,
            letterRendering: pletterRendering,
            allowTaint: pallowTaint,
            logging: plogging
        });
    },
    // html2canvas with DOM selector function
    dohtml2canvasDom: function(pElement, popenWindow, pAjaxIdentifier, pbackground, pletterRendering, pallowTaint, plogging) {
        // Parameter
        if (pElement.id) {
            phtmlElem = '#' + pElement.id;
        } else {
            if (pElement.className) {
                phtmlElem = pElement.tagName.toLowerCase();
                phtmlElem += ('.' + jQuery.trim(pElement.className).replace(/ /g, '.')).replace(/\.\.+/g, '.');
            }
        }
        pwidth = $(pElement).width();
        pheight = $(pElement).height();
        // Logging
        if (plogging) {
            console.log('dohtml2canvasDom: HTML element:', phtmlElem);
            console.log('dohtml2canvasDom: element width:', pwidth);
            console.log('dohtml2canvasDom: element height:', pheight);
            console.log('dohtml2canvasDom: Clicked element:', pElement);
        }
        // html2canvas
        html2canvas($(phtmlElem), {
            onrendered: function(canvas) {
                // wait spinner
                var lSpinner$ = apex.util.showSpinner($('body'));
                // getImage
                apexScreenCapture.getImage(pAjaxIdentifier, canvas, popenWindow, function() {
                    // remove spinner
                    lSpinner$.remove();
                });
            },
            background: pbackground,
            width: pwidth,
            height: pheight,
            letterRendering: pletterRendering,
            allowTaint: pallowTaint,
            logging: plogging
        });
    },
    // function that gets called from plugin
    captureScreen: function() {
        // plugin attributes
        var daThis = this;
        var vAjaxIdentifier = daThis.action.ajaxIdentifier;
        var vhtmlElem = daThis.action.attribute01;
        var vopenWindow = daThis.action.attribute02;
        var vbackground = daThis.action.attribute04;
        var vwidth = parseInt(daThis.action.attribute05);
        var vheight = parseInt(daThis.action.attribute06);
        var vletterRendering = apexScreenCapture.parseBoolean(daThis.action.attribute07);
        var vallowTaint = apexScreenCapture.parseBoolean(daThis.action.attribute08);
        var vlogging = apexScreenCapture.parseBoolean(daThis.action.attribute09);
        var vdomSelector = daThis.action.attribute10;
        var vdomFilter = daThis.action.attribute11;
        var vdomhideLabel = apexScreenCapture.parseBoolean(daThis.action.attribute12);
        var vdomfillContent = apexScreenCapture.parseBoolean(daThis.action.attribute13);
        var vdomborderColor = daThis.action.attribute14;
        // device width/height
        var clientWidth = parseInt(document.documentElement.clientWidth);
        var clientHeight = parseInt(document.documentElement.clientHeight);
        if (vwidth === null || vwidth === undefined || isNaN(parseFloat(vwidth))) {
            vwidth = clientWidth;
        }
        if (vheight === null || vheight === undefined || isNaN(parseFloat(vheight))) {
            vheight = clientHeight;
        }
        // defaults for DOM Outliner
        if (vdomFilter === null || vdomFilter === undefined) {
            vdomFilter = false;
        }
        if (vdomhideLabel === null || vdomhideLabel === undefined) {
            vdomhideLabel = false;
        }
        if (vdomfillContent === null || vdomfillContent === undefined) {
            vdomfillContent = false;
        }
        // Logging
        if (vlogging) {
            console.log('captureScreen: Attribute JQuery selector:', vhtmlElem);
            console.log('captureScreen: Attribute open window:', vopenWindow);
            console.log('captureScreen: Attribute background:', vbackground);
            console.log('captureScreen: Attribute element width:', vwidth);
            console.log('captureScreen: Attribute element height:', vheight);
            console.log('captureScreen: Attribute letter rendering:', vletterRendering);
            console.log('captureScreen: Attribute allow taint:', vallowTaint);
            console.log('captureScreen: Attribute Logging:', vlogging);
            console.log('captureScreen: Attribute DOM selector:', vdomSelector);
            console.log('captureScreen: Attribute DOM filter:', vdomFilter);
            console.log('captureScreen: Attribute hide label:', vdomhideLabel);
            console.log('captureScreen: Attribute fill content:', vdomfillContent);
            console.log('captureScreen: Attribute border color:', vdomborderColor);
        }
        if (vdomSelector == 'Y') {
            // html2canvas with DOM Outliner
            var myClickHandler = function(element) {
                apexScreenCapture.dohtml2canvasDom(element, vopenWindow, vAjaxIdentifier, vbackground, vletterRendering, vallowTaint, vlogging);
            };
            var myDomOutline = DomOutline({
                onClick: myClickHandler,
                filter: vdomFilter,
                stopOnClick: true,
                borderColor: vdomborderColor,
                hideLabel: vdomhideLabel,
                fillContent: vdomfillContent
            });
            myDomOutline.start();
        } else {
            // html2canvas
            apexScreenCapture.dohtml2canvas(vhtmlElem, vopenWindow, vAjaxIdentifier, vbackground, vwidth, vheight, vletterRendering, vallowTaint, vlogging);
        }
    }
};
