var isNewAndroidWC = false;
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
    if ( document.readyState === 'complete' ) {
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
  var isAndroid = 'Android';
  var isMicroMessenger = 'MicroMessenger/6.5.8';
  if (navigator.userAgent.indexOf(isAndroid) !== -1 && navigator.userAgent.indexOf(isMicroMessenger) !== -1) {
    isNewAndroidWC = true;
    setInterval(function(){
      if (document.activeElement !== document.getElementsByTagName('textarea')[0]) document.getElementById('conversational-form').removeAttribute('style');
    },200);
  }
  var loading = document.getElementById('loading');
  loading.remove();
  var textarea = document.getElementsByTagName('textarea');
  textarea[0].addEventListener('touchstart', function(){
    // textarea[0].addEventListener('touchend', function(){
      setTimeout(function(){
        window.scrollTo(0, 65535);
        if (isNewAndroidWC) {
          document.getElementById('conversational-form').setAttribute('style','height:55%;margin-top:0');
          document.addEventListener('backbutton', function(){
            alert('hello');
          });
        }
      },100);
    });
  // });
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
var WeimobChat = new cf.ConversationalForm({
  formEl: document.getElementById('chat'),
  userImage: 'img/human.png',
  submitCallback: function(){},
  flowStepCallback: function(dto, success, error){
    function submission(value){
      var jsonform = WeimobChat._eventTarget.cf.getFormData(true);
      var file = document.querySelector('#chat > fieldset > input[type="file"]').files[0];
      var reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onerror = function(error){
        console.log('Error: ', error);
      };
      reader.onload = function(){
        var img = new Image();
        img.src = reader.result;
        var canvas = document.createElement('canvas');
        img.onload = function(){
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
          jsonform.pic = canvas.toDataURL('image/jpeg', 0.2);
          firebase.database().ref((new Date()).getTime()).set(
            jsonform
          ).then(function(){
            var thinking = document.getElementsByTagName('thinking');
            thinking[0].parentNode.parentNode.remove();
            WeimobChat._eventTarget.cf.addUserChatResponse(value);
            WeimobChat._eventTarget.cf.addRobotChatResponse('收到您的信息啦 🙌，谢谢 🙏');
            document.getElementsByTagName('cf-input')[0].setAttribute('style','display:none');
            document.getElementsByTagName('cf-chat')[0].setAttribute('style','padding-bottom:0');
          });
        }
      };
    }
    if (dto.tag.domElement) {
      if (dto.tag.domElement.getAttribute('name') == 'number') {
        success();
        document.getElementsByTagName('textarea')[0].setAttribute('disabled','disabled');
      } else if (dto.tag.domElement.getAttribute('name') == 'pic') {
        success();
        document.getElementsByTagName('textarea')[0].classList.add('hidden');
        document.getElementsByTagName('cf-input-button')[0].classList.add('hidden');
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