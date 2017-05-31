var newtime = (new Date()).getTime();
var imguploaded = false;
(function(funcName, baseObj) {
  funcName = funcName || 'docReady';
  baseObj = baseObj || window;
  var readyList = [];
  var readyFired = false;
  var readyEventHandlersInstalled = false;
  function ready() {
    if (!readyFired) {
      readyFired = true;
      for (var i = 0; i < readyList.length; i++) {
        readyList[i].fn.call(window, readyList[i].ctx);
      }
      readyList = [];
    }
  }
  function readyStateChange() {
    if (document.readyState === 'complete') {
      ready();
    }
  }
  baseObj[funcName] = function(callback, context) {
    if (typeof callback !== 'function') {
      throw new TypeError('callback for docReady(fn) must be a function');
    }
    if (readyFired) {
      setTimeout(function() {callback(context);}, 1);
      return;
    } else {
      readyList.push({fn: callback, ctx: context});
    }
    if (document.readyState === 'complete') {
      setTimeout(ready, 1);
    } else if (!readyEventHandlersInstalled) {
      if (document.addEventListener) {
        document.addEventListener('DOMContentLoaded', ready, false);
        window.addEventListener('load', ready, false);
      } else {
        document.attachEvent('onreadystatechange', readyStateChange);
        window.attachEvent('onload', ready);
      }
      readyEventHandlersInstalled = true;
    }
  }
})('docReady', window);
docReady(function(){
  var loading = document.getElementById('loading');
  loading.remove();
  var textarea = document.getElementsByTagName('textarea');
  textarea[0].addEventListener('touchend', function(){
    setTimeout(function(){
      window.scrollTo(0, 65535);
    },100);
  });
});
var config = {
  apiKey: "AIzaSyAwi6QIrGQLsWOc_tRydxgU9UjGFHaYGSE",
  authDomain: "weimob-chatform.firebaseapp.com",
  databaseURL: "https://weimob-chatform.firebaseio.com",
  projectId: "weimob-chatform",
  storageBucket: "weimob-chatform.appspot.com",
  messagingSenderId: "578140351194"
};
firebase.initializeApp(config);
var database = firebase.database();
function base64tobinary(base64img){
  var pureBase64ImageData =
  base64img.replace(
    /^data:(image\/.+);base64,/,
    function ($0, $1) {
      contentType = $1
      return ''
    }
  );
  return atob(pureBase64ImageData);
}
function string2ArrayBuffer(string){
  var bytes = Array.prototype.map.call(string, function (c) {
    return c.charCodeAt(0) & 0xff
  });
  return new Uint8Array(bytes).buffer
}
function newBlob(data, datatype){
  var out
  try {
    out = new Blob([data], { type: datatype })
  } catch (e) {
    window.BlobBuilder = window.BlobBuilder ||
    window.WebKitBlobBuilder ||
    window.MozBlobBuilder ||
    window.MSBlobBuilder
    if (e.name == 'TypeError' && window.BlobBuilder) {
      var bb = new BlobBuilder()
      bb.append(data)
      out = bb.getBlob(datatype)
    } else if (e.name == 'InvalidStateError') {
      out = new Blob([data], { type: datatype })
    } else {
      throw new Error('Your browser does not support Blob & BlobBuilder!')
    }
  }
  return out
}
function dataURL2Blob(dataURI){
  var byteStr
  var intArray
  var ab
  var i
  var mimetype
  var parts
  parts = dataURI.split(',')
  parts[1] = parts[1].replace(/\s/g, '')
  if (~parts[0].indexOf('base64')) {
    byteStr = atob(parts[1])
  } else {
    byteStr = decodeURIComponent(parts[1])
  }
  ab = new ArrayBuffer(byteStr.length)
  intArray = new Uint8Array(ab)
  for (i = 0; i < byteStr.length; i++) {
    intArray[i] = byteStr.charCodeAt(i)
  }
  mimetype = parts[0].split(':')[1].split(';')[0]
  return new newBlob(ab, mimetype)
}
function resetOrientation(srcBase64, srcOrientation, callback) {
  var img = new Image();
  img.onload = function() {
    var width = img.width,
        height = img.height,
        canvas = document.createElement('canvas'),
        ctx = canvas.getContext("2d");
    if ([5,6,7,8].indexOf(srcOrientation) > -1) {
      canvas.width = height;
      canvas.height = width;
    } else {
      canvas.width = width;
      canvas.height = height;
    }
    switch (srcOrientation) {
      case 2: ctx.transform(-1, 0, 0, 1, width, 0); break;
      case 3: ctx.transform(-1, 0, 0, -1, width, height ); break;
      case 4: ctx.transform(1, 0, 0, -1, 0, height ); break;
      case 5: ctx.transform(0, 1, 1, 0, 0, 0); break;
      case 6: ctx.transform(0, 1, -1, 0, height , 0); break;
      case 7: ctx.transform(0, -1, -1, 0, height , width); break;
      case 8: ctx.transform(0, -1, 1, 0, 0, width); break;
      default: ctx.transform(1, 0, 0, 1, 0, 0);
    }
    ctx.drawImage(img, 0, 0);
    callback(canvas.toDataURL());
  };
  img.src = srcBase64;
}
function uploadimg(file){
  EXIF.getData(file, function () {
    var orientation = EXIF.getTag(this, 'Orientation');
    if (orientation === undefined) orientation = 0;
    window.URL = window.URL || window.webkitURL;
    if (url) {
      window.URL.revokeObjectURL(url);
    }
    var url = window.URL.createObjectURL(file);
    var img = new Image();
    img.src = url;
    img.onload = function () {
      var canvas = document.createElement('canvas');
      if (img.width < 640 && img.height < 640) {
        canvas.width = img.width;
        canvas.height = img.height;
      } else if (img.width > img.height) {
        canvas.width = 640;
        canvas.height = img.height / img.width * 640;
      } else {
        canvas.height = 640;
        canvas.width = img.width / img.height * 640;
      }
      var ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, canvas.width, canvas.height);
      var base64img = canvas.toDataURL('image/jpeg', 0.5);
      resetOrientation(base64img, orientation, function (base64img) {
        document.querySelector('.file-icon > span > img').setAttribute('src', base64img);
        var updates = {};
        updates['/pic/'] = base64img;
        firebase.database().ref(newtime).update(
          updates
        ).then(function(){
          imguploaded = true;
        });
      });
    };
  });
}
var WeimobChat = new cf.ConversationalForm({
  formEl: document.getElementById('chat'),
  userImage: 'img/human.png',
  submitCallback: function(){},
  flowStepCallback: function(dto, success, error){
    function submission(value){
      var textnode = document.createTextNode('正在上传中，请稍后...');
      document.getElementsByTagName('thinking')[0].parentNode.insertBefore(textnode,document.getElementsByTagName('thinking')[0]);
      document.getElementsByTagName('cf-input')[0].setAttribute('style','display:none');
      document.getElementsByTagName('cf-chat')[0].setAttribute('style','padding-bottom:0');
      var jsonform = WeimobChat._eventTarget.cf.getFormData(true);
      delete jsonform.pic;
      var updates = {};
      for (var key in jsonform) {
        updates['/' + key + '/'] = jsonform[key];
      }
      firebase.database().ref(newtime).update(
        updates
      ).then(function(){
        received();
        function received() {
          if (!imguploaded) {
            setTimeout(function(){
              received();
            },500);
          } else {
            var thinking = document.getElementsByTagName('thinking');
            thinking[0].parentNode.parentNode.remove();
            WeimobChat._eventTarget.cf.addUserChatResponse(value);
            WeimobChat._eventTarget.cf.addRobotChatResponse('收到您的信息啦 🙌，谢谢 🙏');
          }
        }
      });
    }
    if (dto.tag.domElement) {
      if (dto.tag.domElement.getAttribute('name') == 'number') {
        success();
        document.getElementsByTagName('textarea')[0].setAttribute('disabled','disabled');
      } else if (dto.tag.domElement.getAttribute('name') == 'pic') {
        success();
        document.getElementsByTagName('textarea')[0].classList.add('hidden');
        document.getElementsByTagName('cf-input-button')[0].classList.add('hidden');
        var file = document.querySelector('#chat > fieldset > input[type="file"]').files[0];
        uploadimg(file);
      } else if (dto.tag.domElement.getAttribute('name') == 'mission') {
        if (dto.tag.domElement.value == '公务') {
          success();
          document.getElementsByTagName('textarea')[0].removeAttribute('disabled');
        } else {
          submission(dto.tag.domElement.value);
        }
        document.getElementsByTagName('textarea')[0].classList.remove('hidden');
        document.getElementsByTagName('cf-input-button')[0].classList.remove('hidden');
      } else if (dto.tag.domElement.getAttribute('name') == 'visitee') {
        submission(dto.tag.domElement.value);
      }
      else {
        success();
      }
      window.self.focus();
      document.getElementsByTagName('textarea')[0].focus();
      document.getElementsByTagName('textarea')[0].select();
    } else {
      success();
    }
  }
})