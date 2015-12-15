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
function captureScreen() {
  // plugin attributes
  var daThis           = this;
  var vhtmlElem        = daThis.action.attribute01;
  var vopenWindow      = daThis.action.attribute02;
  var vitemName        = daThis.action.attribute03;
  var vbackground      = daThis.action.attribute04;
  var vwidth           = parseInt(daThis.action.attribute05);
  var vheight          = parseInt(daThis.action.attribute06);
  var vletterRendering = Boolean(daThis.action.attribute07);
  var vallowTaint      = Boolean(daThis.action.attribute08);
  var vlogging         = Boolean(daThis.action.attribute09);
  // device width/height
  var clientWidth  = parseInt(document.documentElement.clientWidth);
  var clientHeight = parseInt(document.documentElement.clientHeight);
  if (vwidth == null || vwidth == undefined || isNaN(parseFloat(vwidth))) {
    vwidth = clientWidth;
  }
  if (vheight == null || vheight == undefined || isNaN(parseFloat(vheight))) {
    vheight = clientHeight;
  }
  // html2canvas
  html2canvas($(vhtmlElem), {
    onrendered: function(canvas) {
      getImage(vitemName,canvas,vopenWindow);
    },
    background : vbackground,
    width: vwidth,
    height: vheight,
    letterRendering : vletterRendering,
    allowTaint : vallowTaint,
    logging : vlogging
  });
}