$(document).ready(function() {
    $('.word-translation').click(function() {
        $('.word-translation').hide();
        translation = $(this).attr('word-translation');
        word_original = $('#word-original').text();
        $('#word-original').text(word_original + ' - ' + translation);
        message_box = $('#message')        
        message_box.text('Translation will show for 5 seconds. Then next word will show');
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
	message_box = $('#message')
        console.log(' word word_id ' + word_id + ' result ' + train_result);

        $.ajax({
            url: '/train/next',
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
});

