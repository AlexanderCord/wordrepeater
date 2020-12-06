$(document).ready(function() {


    $('.word-translation').click(function() {
        $('.word-translation').hide();
        translation = $(this).attr('word-translation');
        word_original = $('#word-original').text();
        $('#word-original').text(word_original + ' - ' + translation);
        message_box = $('#message')        
        message_box.text('Translation will show for 5 seconds. Then next word will show').show();
        message_box.fadeIn('slow', function() {
            message_box.delay(5000).fadeOut();
        });

        window.setTimeout( function() {
            $('.btn-train[train-result=no]').click();
            $('.btn-train').show(); 
            $('.word-translation').show();
        }, 5000);
        $('.btn-train').hide();
        
    });
    $(".btn-train").click(function() {
        word_id = $(this).attr('word-id');
        train_result = $(this).attr('train-result');
        training_mode = $('input[name="training-mode"]:checked').val();
        if(!['default', 'new', 'all'].includes(training_mode)) {
          training_mode = 'default';
        }
        
        
        message_box = $('#message')
        console.log(' word word_id ' + word_id + ' result ' + train_result);

        $.ajax({
            url: '/train/'+training_mode,
            data: {
                'word_id': word_id,
                'train_result': train_result
            },
            dataType: 'json',
            success: function(data) {
                if (data.result) {
                
                    console.log("Result:" + data.result);
                    $('#word-original').text(data.result.word_original);
                    $('.word-translation').attr('word-translation', data.result.word_translation);
                    $('.btn-train').each(function() {
                	btn = $(this);
                	btn.attr('word-id', data.result.word_id);
                    });
                    //message_box.text('Next word');


                } else {
                    console.log("Error has occured during request");
                    message_box.text('Error has occured during request');
                    message_box.fadeIn('slow', function() {
                        message_box.delay(5000).fadeOut();
                    });

                }

            }
        });
        return false;
    });
    
    var training_mode_selected = $.cookie('training-mode'); // Retrieve cookie value
    if(training_mode_selected != null) {
        $('input[name="training-mode"][value="' + training_mode_selected + '"]').attr('checked', true); // Check matching button
    }      
    $('input[name="training-mode"]').click(function() {
        $.cookie('training-mode', $(this).val(), {expires: 30}); // Save cookie
    });
            

    window.setTimeout(function() {
      $('.btn-train[train-result=skip]').click();
    }, 100);

});

