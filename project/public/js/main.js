$(document).ready(function() {
  $(document).on('submit','#delete-word-form',function(){
    return window.confirm('Do you really want to delete this words?');
       
  });

});

