// APEX Screen capture functions
// Author: Daniel Hochleitner
// Version: 1.9.1

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
    getImage: function(ajaxIdentifier, canvas, openWindow, mimeType, callback) {
        var img = canvas.toDataURL(mimeType);
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
                f01: f01Array,
                x01: mimeType
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
    doHtml2Canvas: function(pHtmlElem, popenWindow, pAjaxIdentifier, pBackground, pWidth, pHeight, pLetterRendering, pAllowTaint, pMimeType, pLogging) {
        // Logging
        if (pLogging) {
            console.log('doHtml2Canvas: HTML element:', pHtmlElem);
            console.log('doHtml2Canvas: element width:', pWidth);
            console.log('doHtml2Canvas: element height:', pHeight);
        }
        // html2canvas
        html2canvas($(pHtmlElem), {
            onrendered: function(canvas) {
                // wait spinner
                var lSpinner$ = apex.util.showSpinner($('body'));
                // getImage
                apexScreenCapture.getImage(pAjaxIdentifier, canvas, popenWindow, pMimeType, function() {
                    // remove spinner
                    lSpinner$.remove();
                });
            },
            background: pBackground,
            width: pWidth,
            height: pHeight,
            letterRendering: pLetterRendering,
            allowTaint: pAllowTaint,
            logging: pLogging
        });
    },
    // html2canvas with DOM selector function
    doHtml2CanvasDom: function(pElement, popenWindow, pAjaxIdentifier, pBackground, pLetterRendering, pAllowTaint, pMimeType, pLogging) {
        // Parameter
        if (pElement.id) {
            pHtmlElem = '#' + pElement.id;
        } else {
            if (pElement.className) {
                pHtmlElem = pElement.tagName.toLowerCase();
                pHtmlElem += ('.' + jQuery.trim(pElement.className).replace(/ /g, '.')).replace(/\.\.+/g, '.');
            }
        }
        pWidth = $(pElement).width();
        pHeight = $(pElement).height();
        // Logging
        if (pLogging) {
            console.log('doHtml2CanvasDom: HTML element:', pHtmlElem);
            console.log('doHtml2CanvasDom: element width:', pWidth);
            console.log('doHtml2CanvasDom: element height:', pHeight);
            console.log('doHtml2CanvasDom: Clicked element:', pElement);
        }
        // html2canvas
        html2canvas($(pHtmlElem), {
            onrendered: function(canvas) {
                // wait spinner
                var lSpinner$ = apex.util.showSpinner($('body'));
                // getImage
                apexScreenCapture.getImage(pAjaxIdentifier, canvas, popenWindow, pMimeType, function() {
                    // remove spinner
                    lSpinner$.remove();
                });
            },
            background: pBackground,
            width: pWidth,
            height: pHeight,
            letterRendering: pLetterRendering,
            allowTaint: pAllowTaint,
            logging: pLogging
        });
    },
    // function that gets called from plugin
    captureScreen: function() {
        // plugin attributes
        var daThis = this;
        var vAjaxIdentifier = daThis.action.ajaxIdentifier;
        var vHtmlElem = daThis.action.attribute01;
        var vOpenWindow = daThis.action.attribute02;
        var vBackground = daThis.action.attribute04;
        var vWidth = parseInt(daThis.action.attribute05);
        var vHeight = parseInt(daThis.action.attribute06);
        var vLetterRendering = apexScreenCapture.parseBoolean(daThis.action.attribute07);
        var vAllowTaint = apexScreenCapture.parseBoolean(daThis.action.attribute08);
        var vLogging = apexScreenCapture.parseBoolean(daThis.action.attribute09);
        var vDomSelector = daThis.action.attribute10;
        var vDomFilter = daThis.action.attribute11;
        var vDomHideLabel = apexScreenCapture.parseBoolean(daThis.action.attribute12);
        var vDomFillContent = apexScreenCapture.parseBoolean(daThis.action.attribute13);
        var vDomBorderColor = daThis.action.attribute14;
        var vImageType = daThis.action.attribute15;
        var vImageMimeType;
        // device width/height
        var clientWidth = parseInt(document.documentElement.clientWidth);
        var clientHeight = parseInt(document.documentElement.clientHeight);
        if (vWidth === null || vWidth === undefined || isNaN(parseFloat(vWidth))) {
            vWidth = clientWidth;
        }
        if (vHeight === null || vHeight === undefined || isNaN(parseFloat(vHeight))) {
            vHeight = clientHeight;
        }
        // defaults for DOM Outliner
        if (vDomFilter === null || vDomFilter === undefined) {
            vDomFilter = false;
        }
        if (vDomHideLabel === null || vDomHideLabel === undefined) {
            vDomHideLabel = false;
        }
        if (vDomFillContent === null || vDomFillContent === undefined) {
            vDomFillContent = false;
        }
        // Image mimeType
        if (vImageType == 'PNG') {
            vImageMimeType = 'image/png';
        } else if (vImageType == 'JPEG') {
            vImageMimeType = 'image/jpeg';
        } else {
            vImageMimeType = 'image/png';
        }
        // Logging
        if (vLogging) {
            console.log('captureScreen: Attribute JQuery selector:', vHtmlElem);
            console.log('captureScreen: Attribute open window:', vOpenWindow);
            console.log('captureScreen: Attribute background:', vBackground);
            console.log('captureScreen: Attribute element width:', vWidth);
            console.log('captureScreen: Attribute element height:', vHeight);
            console.log('captureScreen: Attribute letter rendering:', vLetterRendering);
            console.log('captureScreen: Attribute allow taint:', vAllowTaint);
            console.log('captureScreen: Attribute Logging:', vLogging);
            console.log('captureScreen: Attribute DOM selector:', vDomSelector);
            console.log('captureScreen: Attribute DOM filter:', vDomFilter);
            console.log('captureScreen: Attribute hide label:', vDomHideLabel);
            console.log('captureScreen: Attribute fill content:', vDomFillContent);
            console.log('captureScreen: Attribute border color:', vDomBorderColor);
            console.log('captureScreen: Attribute image mime-type:', vImageMimeType);
        }
        if (vDomSelector == 'Y') {
            // html2canvas with DOM Outliner
            var myClickHandler = function(element) {
                apexScreenCapture.doHtml2CanvasDom(element, vOpenWindow, vAjaxIdentifier, vBackground, vLetterRendering, vAllowTaint, vImageMimeType, vLogging);
            };
            var myDomOutline = DomOutline({
                onClick: myClickHandler,
                filter: vDomFilter,
                stopOnClick: true,
                borderColor: vDomBorderColor,
                hideLabel: vDomHideLabel,
                fillContent: vDomFillContent
            });
            myDomOutline.start();
        } else {
            // html2canvas
            apexScreenCapture.doHtml2Canvas(vHtmlElem, vOpenWindow, vAjaxIdentifier, vBackground, vWidth, vHeight, vLetterRendering, vAllowTaint, vImageMimeType, vLogging);
        }
    }
};
