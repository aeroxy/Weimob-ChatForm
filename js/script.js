$(window).on('resize',function(){
  $('cf-chat scrollable').scrollTop(65534);
});
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
  userImage: 'img/human.png',
  submitCallback: function(){},
  flowStepCallback: function(dto, success, error){
    function submission(){
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
          canvas.width = img.width;
          canvas.height = img.height;
        }
        var ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        jsonform.pic = canvas.toDataURL('image/jpeg', 0.5);
        firebase.database().ref((new Date()).getTime()).set(
          jsonform
        ).then(function(){
          WeimobChat._eventTarget.cf.addRobotChatResponse('收到您的信息啦 🙌，谢谢 🙏');
        });
      };
    }
    if (dto.tag.domElement) {
      if (dto.tag.domElement.getAttribute('name') == 'number') {
        success();
        document.getElementsByTagName('textarea')[0].setAttribute('disabled','disabled');
      } else
      if (dto.tag.domElement.getAttribute('name') == 'mission') {
        if (dto.tag.domElement.value == 'business') {
          success();
          document.getElementsByTagName('textarea')[0].removeAttribute('disabled');
        } else {
          submission();
        }
      } else if (dto.tag.domElement.getAttribute('name') == 'visitee') {
        submission();
      }
      else {
        success();
      }
    } else {
      success();
    }
  }
})