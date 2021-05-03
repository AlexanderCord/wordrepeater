$(document).ready(function() {


    function showAnswer(next, args) {
	    var next = next;
	    var args = args;
        translation = $('#word-translation').attr('word-translation');
        word_original = $('#word-original').text();
        $('#word-original').text(word_original + ' - ' + translation);
        message_box = $('#message')        
        message_box.text('Translation will show for 5 seconds. Then next word will show').show();
        message_box.fadeIn('slow', function() {
            message_box.delay(5000).fadeOut();
        });

        $('.btn-train').hide();
        console.log('[' + new Date().toUTCString() + '] ' + 'showing answer')

        window.setTimeout( function() {
            $('.btn-train').show(); 
            console.log(args);
            console.log('[' + new Date().toUTCString() + '] ' + 'sending ajax')
            next(args);
            
        }, 5000);
        
    }
    $(".btn-train").click(function() {
        word_id = $(this).attr('word-id');
        train_result = $(this).attr('train-result');
        training_mode = $('input[name="training-mode"]:checked').val();
        train_progress = $('#train-progress');
        train_progress_words = $('#train-progress-words');
        words_done = parseInt(train_progress_words.text())
        if(isNaN(words_done)) {
            words_done = 0;
        } else {
            words_done++;
        }
        train_progress_words.text(words_done);        
        


        if(!['default', 'new', 'all'].includes(training_mode)) {
          training_mode = 'default';
        }
        
        args_vals = {
           'word_id' : word_id,
           'training_mode': training_mode,
           'train_result' : train_result
        }
        next = function(args) { sendTrainResult(args); }
        if(train_result == "no" && $('#training-answer').is(':checked')) {
    	    console.log('[' + new Date().toUTCString() + '] ' + 'calling show answer')
    	    showAnswer( next, args_vals );
        } else {
    	    next(args_vals);
        
        
        }
        
    });        

    function sendTrainResult(args) {
        console.log(args);
	    let word_id = args['word_id'];
	    let training_mode = args['training_mode'];
	    let train_result = args['train_result'];
        message_box = $('#message');
        let training_method_original = $('#training-method-original').is(':checked');
        let date_from = $('#filter-date-from').val();
        let date_to = $('#filter-date-to').val();
        
        console.log(' word word_id ' + word_id + ' result ' + train_result);

        $.ajax({
            url: '/train/'+training_mode,
            data: {
                'word_id': word_id,
                'train_result': train_result,
                'method_original': training_method_original,
                'date_from':  date_from,
                'date_to': date_to, 
            },
            dataType: 'json',
            success: function(data) {
                if (data.result) {
                
                    console.log("Result:" + data.result);
                    $('#word-original').text(data.result.word_original);
                    $('#word-translation').attr('word-translation', data.result.word_translation);
                    $('.btn-train').each(function() {
                	    btn = $(this);
                	    btn.attr('word-id', data.result.word_id);
                    });
                    loadWordStats(data.result.word_id);
                    //message_box.text('Next word');


                } else {
                    errorText = data.error ? data.error : ""
                    errorMessage = "Error has occured during request " + (errorText ? ": " + errorText : "");
                    console.log(errorMessage);
                    message_box.text(errorMessage);
                    message_box.fadeIn('slow', function() {
                        message_box.delay(5000).fadeOut();
                    });

                }

            }
        });
    }

    
    function loadWordStats(word_id) {
        console.log(word_id);
        let date_from = $('#filter-date-from').val();
        let date_to = $('#filter-date-to').val();
        $.ajax({
            url: '/train/stats',
            data: {
                'word_id': word_id,
                'date_from': date_from,
                'date_to': date_to,                 
            },
            dataType: 'json',
            success: function(data) {
                if (data.result) {
                
                    console.log("Result:" + data.result);
                    if(data.result.train_stats[0]) {
                      row = data.result.train_stats[0];
                      $('#train-stats').text("" +  Math.round(row.ratio * 100) + "% (Yes: " + row.train_result_yes + ", No: " + row.train_result_no + ")");
                      $('#train-stats').attr('class', row.ratio > 0.9 ? 'badge badge-success' : 'badge badge-warning');
                    } else {
                      $('#train-stats').text("Haven't trained")
                      $('#train-stats').attr('class', 'badge badge-secondary');
                    
                    }
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
        
    }
    
    var training_mode_selected = $.cookie('training-mode'); // Retrieve cookie value
    if(training_mode_selected != null) {
        $('input[name="training-mode"][value="' + training_mode_selected + '"]').attr('checked', true); // Check matching button
    }      
    $('input[name="training-mode"]').click(function() {
        $.cookie('training-mode', $(this).val(), {expires: 30}); // Save cookie
    });

    var training_answer_selected = $.cookie('training-answer'); // Retrieve cookie value
    if(training_answer_selected != null) {
        $('#training-answer').prop('checked', training_answer_selected === "true" ? true : false ); // Check matching button
    }      
    $('input[name="training-answer"]').click(function() {
        $.cookie('training-answer', $(this).is(':checked'), {expires: 30}); // Save cookie
    });


    var training_method_original = $.cookie('training-method-original'); // Retrieve cookie value
    if(training_method_original != null) {
        $('#training-method-original').prop('checked', training_method_original === "true" ? true : false ); // Check matching button
    }      
    $('input[name="training-method-original"]').click(function() {
        $.cookie('training-method-original', $(this).is(':checked'), {expires: 30}); // Save cookie
    });    


    window.setTimeout(function() {
      $('.btn-train[train-result=skip]').click();
    }, 100);

    $("#filter-date-from").datepicker({
        dateFormat: 'yy-mm-dd',
            firstDay: 1,                
        }).datepicker("setDate", new Date(new Date().getTime()-1000*60*60*24*30));

    $("#filter-date-to").datepicker({
        dateFormat: 'yy-mm-dd',
            firstDay: 1,                
        }).datepicker("setDate", new Date());



});

