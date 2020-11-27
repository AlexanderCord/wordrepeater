$(document).ready(function() {
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
                    $('#word_original').text(data.result.word_original);
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

