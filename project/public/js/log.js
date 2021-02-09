$(document).ready(function() {
    $("#filter-date").datepicker({
	dateFormat: 'yy-mm-dd',
        firstDay: 1,    
        onSelect: function(date) { filterByDate(date); }
    });
    
    function fillLog(rows) {
        log_block = $('#log-block');
        if(rows.length > 0) {
            log_block.html('');
            log_block.append(
                $('<ul></ul>')
                .attr('id' , 'log-rows')
            );
                	
            log_rows = $('#log-rows');
            for(var i=0; i<rows.length; i++) {
                item = rows[i];
                li = $('<li>'
                    + moment(item.added).utc().format("YYYY-MM-DD HH:mm:ss")
                    + ' <a href="/vocabulary/word/'+item.word_id._id+'">'  + item.word_id.original + '</a>'
                    + ' - ' + (item.train_result ? 'yes' : 'no')
                    +'</li>');
                    log_rows.append(li);
                }
                	
        } else {
            log_block.text('No results found');
        }

    }
    
    $('#filter-reset').click(function() {
        $.ajax({
            url: '/train/log/all',
            dataType: 'json',
            success: function(data) {
                if (data.result) {
                    console.log("Result:" + data.result);
                    fillLog(data.result.log)
                } else {
                    console.log("Error has occured during request");
                }

            }
        });
        return false;

    });
    
    
    function filterByDate(filter_date) {
       
        console.log(filter_date);
        $.ajax({
            url: '/train/log/filter',
            data: {
                'date': filter_date,
            },
            dataType: 'json',
            success: function(data) {
                if (data.result) {
                    
                    console.log("Result:" + data.result);
                    fillLog(data.result.log)
                


                } else {
                    console.log("Error has occured during request");
                }

            }
        });
        return false;
    }

    loadCharts();

    function loadCharts() {


        $.ajax({
            url: '/train/log/days_trained_yes',
            data: {},
            dataType: 'json',
            success: function(data) {
                if (data.result) {
                    let dataPoints = []
                    let labelPoints = []
                    for(let i=0; i < data.result.data.length; i++){
                        let item = data.result.data[i];
                        dataPoints[dataPoints.length] = 
                        {
                            x: moment(item._id).toDate(),
                            y: item.count
                        }
                        labelPoints[labelPoints.length] = item._id
                    }

                    var config = {
                        type: 'line',
                        data: {
                            labels: labelPoints,
                            datasets: [{
                                label: 'Words trained successfully',
                                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                                borderColor: 'rgba(255, 99, 132, 0.2)',
                                data: dataPoints,
                                fill: false,
                            }, ]
                        },
                        options: {
                            responsive: true,
                            plugins: {
                                title: {
                                    display: true,
                                    text: 'Yes chart for last 90 days'
                                },
                                tooltip: {
                                    mode: 'index',
                                    intersect: false,
                                }
                            },
                            hover: {
                                mode: 'nearest',
                                intersect: false
                            },
                            scales: {
                                x: {
                                    display: true,
                                    scaleLabel: {
                                        display: true,
                                        labelString: 'Date',
                                        type: 'date'

                                    }
                                },
                                y: {
                                    display: true,
                                    scaleLabel: {
                                        display: true,
                                        labelString: 'Value'
                                    }
                                }
                            }
                        }
                    };
                    var ctx = document.getElementById('yesCanvas').getContext('2d');
			        window.myLine = new Chart(ctx, config);

                }   

            }
        });

        
    }

});

