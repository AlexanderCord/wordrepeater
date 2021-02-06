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

    

    var chart1 = new CanvasJS.Chart("yesChart",
    {
        title: {
            text: "Yes chart"               
        },
        axisX:{      
            valueFormatString: "DD-MMM" ,
            labelAngle: -50
        },
        axisY: {
          valueFormatString: "#,###"
      },

      data: [
      {        
        type: "area",
        color: "rgba(0,75,141,0.7)",
        dataPoints: [

        { x: new Date(2012, 06, 15), y: 0},       
        { x: new Date(2012, 06, 18), y: 20 }, 
        { x: new Date(2012, 06, 23), y: 30 }, 
        { x: new Date(2012, 07, 1), y: 10}, 
        { x: new Date(2012, 07, 11), y: 21}, 
        { x: new Date(2012, 07, 23), y: 50} ,
        { x: new Date(2012, 07, 31), y: 75}, 
        { x: new Date(2012, 08, 04), y: 10},
        { x: new Date(2012, 08, 10), y: 12},
        { x: new Date(2012, 08, 13), y: 15}, 
        { x: new Date(2012, 08, 16), y: 17}, 
        { x: new Date(2012, 08, 18), y: 20}, 
        { x: new Date(2012, 08, 21), y: 22}, 
        { x: new Date(2012, 08, 24), y: 25}, 
        { x: new Date(2012, 08, 26), y: 27}, 
        { x: new Date(2012, 08, 28), y: 30} 
        ]
    }
    
    ]
    });
    var chart2 = new CanvasJS.Chart("noChart",
    {
        title: {
            text: "No chart"               
        },
        axisX:{      
            valueFormatString: "DD-MMM" ,
            labelAngle: -50
        },
        axisY: {
          valueFormatString: "#,###"
      },

      data: [
      {        
        type: "area",
        color: "rgba(0,75,141,0.7)",
        dataPoints: [

        { x: new Date(2012, 06, 15), y: 0},       
        { x: new Date(2012, 06, 18), y: 20 }, 
        { x: new Date(2012, 06, 23), y: 30 }, 
        { x: new Date(2012, 07, 1), y: 10}, 
        { x: new Date(2012, 07, 11), y: 21}, 
        { x: new Date(2012, 07, 23), y: 50} ,
        { x: new Date(2012, 07, 31), y: 75}, 
        { x: new Date(2012, 08, 04), y: 10},

        { x: new Date(2012, 08, 21), y: 22}, 
        { x: new Date(2012, 08, 24), y: 25}, 
        { x: new Date(2012, 08, 26), y: 27}, 
        { x: new Date(2012, 08, 28), y: 30} 
        ]
    }
    
    ]
    });    

    chart1.render();
    chart2.render();

});

