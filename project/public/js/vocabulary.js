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
  
  $(function() {
    for (i = 0; i < 26; i++) {
    
      letter = (i+10).toString(36).toUpperCase();
      console.log('F' + letter);
      var link = $('<a></a>');
      link.attr('href', '#letter=' + letter);
      link.text(letter);
      $('#letter-filter').append(link);
      if(i <= 24) $('#letter-filter').append(' | ');
    }
  });
  
  function filterByWord(word) {
    $('#word-filter').val(word);
    $('#word-filter').keyup();
  }

  function filterByFirstCharacter(char) {
    $("#word-list li").show().filter(function() {
      return $(this).text().trim().substring(0,1).toLowerCase() !== char.toLowerCase();
    }).hide()          
  }

  function hashChanged(hash) {
    var fn = hash.replace('#', "").split('&');
  
    if(fn.length) {
      for (var i = 0; i < fn.length; i++) {
        pair = fn[i].split("=");
        param = pair[0];
        val = pair[1];
        
        if(param == "letter" && val.length == 1) {
          filterByFirstCharacter(val);

        } else if(param == "word" && val.length > 0 ) {
          filterByWord(val);
        }
        
        console.log(param  + '=' + val);
        
        
      }
    }
  }
  var storedHash = window.location.hash;
  window.setInterval(function () {
    if (window.location.hash != storedHash) {
      storedHash = window.location.hash;
      hashChanged(storedHash);
    }
  }, 100);

});


