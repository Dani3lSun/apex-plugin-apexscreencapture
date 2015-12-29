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

function getImage(itemName,canvas,openWindow) {
  var img    = canvas.toDataURL("image/png");
  if (openWindow == 'Y') {
    if (navigator.vendor.indexOf("Apple")==0 && /\sSafari\//.test(navigator.userAgent)) {
      window.location.href = img;
    } else {
    window.open(img,'_blank');
    }
  } else {
    apex.item(itemName).setValue(img);
  }
}

function dohtml2canvas(phtmlElem,popenWindow,pitemName,pbackground,pwidth,pheight,pletterRendering,pallowTaint,plogging) {
  // Logging
  if (plogging) {
    console.log('dohtml2canvas: HTML element:',phtmlElem);
    console.log('dohtml2canvas: element width:',pwidth);
    console.log('dohtml2canvas: element height:',pheight);
  }
  // html2canvas
  html2canvas($(phtmlElem), {
    onrendered: function(canvas) {
      getImage(pitemName,canvas,popenWindow);
    },
    background : pbackground,
    width: pwidth,
    height: pheight,
    letterRendering : pletterRendering,
    allowTaint : pallowTaint,
    logging : plogging
  });
}

function dohtml2canvasDom(pElement,popenWindow,pitemName,pbackground,pletterRendering,pallowTaint,plogging) {
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
      getImage(pitemName,canvas,popenWindow);
    },
    background : pbackground,
    width: pwidth,
    height: pheight,
    letterRendering : pletterRendering,
    allowTaint : pallowTaint,
    logging : plogging
  });
}

function captureScreen() {
  // plugin attributes
  var daThis           = this;
  var vhtmlElem        = daThis.action.attribute01;
  var vopenWindow      = daThis.action.attribute02;
  var vitemName        = daThis.action.attribute03;
  var vbackground      = daThis.action.attribute04;
  var vwidth           = parseInt(daThis.action.attribute05);
  var vheight          = parseInt(daThis.action.attribute06);
  var vletterRendering = parseBoolean(daThis.action.attribute07);
  var vallowTaint      = parseBoolean(daThis.action.attribute08);
  var vlogging         = parseBoolean(daThis.action.attribute09);
  var vdomSelector     = daThis.action.attribute10;
  // device width/height
  var clientWidth  = parseInt(document.documentElement.clientWidth);
  var clientHeight = parseInt(document.documentElement.clientHeight);
  if (vwidth == null || vwidth == undefined || isNaN(parseFloat(vwidth))) {
    vwidth = clientWidth;
  }
  if (vheight == null || vheight == undefined || isNaN(parseFloat(vheight))) {
    vheight = clientHeight;
  }
  // Logging
  if (vlogging) {
    console.log('captureScreen: Attribute JQuery selector:',vhtmlElem);
    console.log('captureScreen: Attribute open window:',vopenWindow);
    console.log('captureScreen: Attribute item name:',vitemName);
    console.log('captureScreen: Attribute background:',vbackground);
    console.log('captureScreen: Attribute element width:',vwidth);
    console.log('captureScreen: Attribute element height:',vheight);
    console.log('captureScreen: Attribute letter rendering:',vletterRendering);
    console.log('captureScreen: Attribute allow taint:',vallowTaint);
    console.log('captureScreen: Attribute Logging:',vlogging);
    console.log('captureScreen: Attribute DOM selector:',vdomSelector);
  }
  if (vdomSelector == 'Y') {
  // html2canvas with DOM Outliner
  var myClickHandler = function (element) { dohtml2canvasDom(element,vopenWindow,vitemName,vbackground,vletterRendering,vallowTaint,vlogging); }
  var myDomOutline = DomOutline({
    onClick: myClickHandler,
    filter: 'div',
    stopOnClick: true,
    hideLabel: false
  });
  myDomOutline.start();
  } else {
  // html2canvas
  dohtml2canvas(vhtmlElem,vopenWindow,vitemName,vbackground,vwidth,vheight,vletterRendering,vallowTaint,vlogging);
  }
}