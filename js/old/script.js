var submitted = false;
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
  submitCallback: function(){},
  flowStepCallback: function(dto, success, error){
    function submission(){
      // var xhr = new XMLHttpRequest();
      // xhr.addEventListener('load', function () {
      //   WeimobChat._eventTarget.cf.addRobotChatResponse('收到您的信息啦 🙌');
      //   success();
      // });
      // xhr.open('POST', document.getElementById('chat').getAttribute('action'));
      // xhr.setRequestHeader('accept', 'application/javascript');
      // xhr.setRequestHeader('Content-Type', 'application/json');
      // xhr.send(JSON.stringify(WeimobChat._eventTarget.cf.getFormData(true)));
      // var now = new Date();
      // var timecode = now.getTime();
      var jsonform = WeimobChat._eventTarget.cf.getFormData(true);
      console.log(WeimobChat._eventTarget.cf.getFormData(true));
      var file = document.querySelector('#chat > fieldset > input[type="file"]').files[0];
      var reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onerror = function(error){
        console.log('Error: ', error);
      };
      reader.onload = function(){
        var base64 = reader.result;
        jsonform.pic = base64;
        console.log(jsonform);
        firebase.database().ref((new Date()).getTime()).set(
          jsonform
          // JSON.stringify(WeimobChat._eventTarget.cf.getFormData(true))
        ).then(function(){
          WeimobChat._eventTarget.cf.addRobotChatResponse('收到您的信息啦 🙌');
          success();
        });
        submitted = true;
      };
    }
    if (dto.tag.domElement) {
      if (dto.tag.domElement.getAttribute('name') == 'repeat') {
        if (dto.tag.domElement.value == 'yes') {
          location.reload();
        } else {
          if (!submitted)
          submission();
        }
      }
      else if (dto.tag.domElement.getAttribute('name') == 'submit-form') {
        if (dto.tag.domElement.value == 'yes') {
          submission();
        } else {
          success();
        }
      }
      else {
        success();
      }
    }
    else {
      success();
    }
  }
});