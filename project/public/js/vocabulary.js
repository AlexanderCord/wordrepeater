$(document).ready(function() {
  $(document).on('submit','#delete-word-form',function(){
    return window.confirm('Do you really want to delete this words?');
       
  });
  $("#word-filter").on("keyup", function() {
    var value = this.value.toLowerCase().trim();
    $("#word-list li").show().filter(function() {
      return $(this).text().toLowerCase().trim().indexOf(value) == -1;
    }).hide();
  });
  
  $("#word-filter-reset").click(function() {
    $('#word-filter').val('');
    $("#word-list li").show();
    
  });

});

