// APEX Screen capture functions
// Author: Daniel Hochleitner
// Version: 1.7

// parse string to boolean
function parseBoolean(pString) {
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
}
// builds a js array from long string
function clob2Array(clob,size,array){
  loopCount = Math.floor(clob.length / size) + 1;
  for (var i = 0; i < loopCount; i++) {
    array.push(clob.slice(size * i,size*(i+1)));
  }
  return array;
}
// converts DataURI to base64 string
function dataURI2base64(dataURI){
    var base64 = dataURI.substr(dataURI.indexOf(',')+1);
    return base64;
}
// get Image (DataURI to Tab / base64 to Apex Ajax)
function getImage(ajaxIdentifier,canvas,openWindow) {
  var img    = canvas.toDataURL("image/png");
  if (openWindow == 'Y') {
    if (navigator.vendor.indexOf("Apple")==0 && /\sSafari\//.test(navigator.userAgent)) {
      window.location.href = img;
    } else {
    window.open(img,'_blank');
    }
  } else {
    // img DataURI to base64
    var base64 = dataURI2base64(img);
    // split base64 clob string to f01 array length 30k
    var f01Array = [];
    f01Array = clob2Array(base64,30000,f01Array);
    // Apex Ajax Call
    apex.server.plugin(ajaxIdentifier, {
                                  f01: f01Array
                                  },{dataType: 'xml'});
  }
}
// html2canvas function
function dohtml2canvas(phtmlElem,popenWindow,pAjaxIdentifier,pbackground,pwidth,pheight,pletterRendering,pallowTaint,plogging) {
  // Logging
  if (plogging) {
    console.log('dohtml2canvas: HTML element:',phtmlElem);
    console.log('dohtml2canvas: element width:',pwidth);
    console.log('dohtml2canvas: element height:',pheight);
  }
  // html2canvas
  html2canvas($(phtmlElem), {
    onrendered: function(canvas) {
      getImage(pAjaxIdentifier,canvas,popenWindow);
    },
    background : pbackground,
    width: pwidth,
    height: pheight,
    letterRendering : pletterRendering,
    allowTaint : pallowTaint,
    logging : plogging
  });
}
// html2canvas with DOM selector function
function dohtml2canvasDom(pElement,popenWindow,pAjaxIdentifier,pbackground,pletterRendering,pallowTaint,plogging) {
  // Parameter
    if (pElement.id) {
      phtmlElem = '#' + pElement.id;
    } else {
      if (pElement.className) {
        phtmlElem = pElement.tagName.toLowerCase();
        phtmlElem += ('.' + jQuery.trim(pElement.className).replace(/ /g, '.')).replace(/\.\.+/g, '.');
      }
    }
  pwidth    = $(pElement).width();
  pheight   = $(pElement).height();
  // Logging
  if (plogging) {
    console.log('dohtml2canvasDom: HTML element:',phtmlElem);
    console.log('dohtml2canvasDom: element width:',pwidth);
    console.log('dohtml2canvasDom: element height:',pheight);
    console.log('dohtml2canvasDom: Clicked element:', pElement);
  }
  // html2canvas
  html2canvas($(phtmlElem), {
    onrendered: function(canvas) {
      getImage(pAjaxIdentifier,canvas,popenWindow);
    },
    background : pbackground,
    width: pwidth,
    height: pheight,
    letterRendering : pletterRendering,
    allowTaint : pallowTaint,
    logging : plogging
  });
}
// function that gets called from plugin
function captureScreen() {
  // plugin attributes
  var daThis              = this;
  var vAjaxIdentifier     = daThis.action.ajaxIdentifier;
  var vhtmlElem           = daThis.action.attribute01;
  var vopenWindow         = daThis.action.attribute02;
  var vbackground         = daThis.action.attribute04;
  var vwidth              = parseInt(daThis.action.attribute05);
  var vheight             = parseInt(daThis.action.attribute06);
  var vletterRendering    = parseBoolean(daThis.action.attribute07);
  var vallowTaint         = parseBoolean(daThis.action.attribute08);
  var vlogging            = parseBoolean(daThis.action.attribute09);
  var vdomSelector        = daThis.action.attribute10;
  var vdomFilter          = daThis.action.attribute11;
  var vdomhideLabel       = parseBoolean(daThis.action.attribute12);
  var vdomfillContent     = parseBoolean(daThis.action.attribute13);
  var vdomborderColor     = daThis.action.attribute14;
  // device width/height
  var clientWidth  = parseInt(document.documentElement.clientWidth);
  var clientHeight = parseInt(document.documentElement.clientHeight);
  if (vwidth == null || vwidth == undefined || isNaN(parseFloat(vwidth))) {
    vwidth = clientWidth;
  }
  if (vheight == null || vheight == undefined || isNaN(parseFloat(vheight))) {
    vheight = clientHeight;
  }
  // defaults for DOM Outliner
  if (vdomFilter == null || vdomFilter == undefined) {
    vdomFilter = false;
  }
  if (vdomhideLabel == null || vdomhideLabel == undefined) {
    vdomhideLabel = false;
  }
  if (vdomfillContent == null || vdomfillContent == undefined) {
    vdomfillContent = false;
  }
  // Logging
  if (vlogging) {
    console.log('captureScreen: Attribute JQuery selector:',vhtmlElem);
    console.log('captureScreen: Attribute open window:',vopenWindow);
    console.log('captureScreen: Attribute background:',vbackground);
    console.log('captureScreen: Attribute element width:',vwidth);
    console.log('captureScreen: Attribute element height:',vheight);
    console.log('captureScreen: Attribute letter rendering:',vletterRendering);
    console.log('captureScreen: Attribute allow taint:',vallowTaint);
    console.log('captureScreen: Attribute Logging:',vlogging);
    console.log('captureScreen: Attribute DOM selector:',vdomSelector);
    console.log('captureScreen: Attribute DOM filter:',vdomFilter);
    console.log('captureScreen: Attribute hide label:',vdomhideLabel);
    console.log('captureScreen: Attribute fill content:',vdomfillContent);
    console.log('captureScreen: Attribute border color:',vdomborderColor);
  }
  if (vdomSelector == 'Y') {
  // html2canvas with DOM Outliner
  var myClickHandler = function (element) { dohtml2canvasDom(element,vopenWindow,vAjaxIdentifier,vbackground,vletterRendering,vallowTaint,vlogging); }
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
  dohtml2canvas(vhtmlElem,vopenWindow,vAjaxIdentifier,vbackground,vwidth,vheight,vletterRendering,vallowTaint,vlogging);
  }
}