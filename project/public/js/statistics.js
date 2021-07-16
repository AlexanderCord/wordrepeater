$(document).ready(function() {
   
    $("#filter-date-from").datepicker({
        dateFormat: 'yy-mm-dd',
            firstDay: 1,                
        })
        //.datepicker("setDate", new Date(new Date().getTime()-1000*60*60*24*30));

    $("#filter-date-to").datepicker({
        dateFormat: 'yy-mm-dd',
            firstDay: 1,                
        })
        //.datepicker("setDate", new Date());



});

