
// GLOBAL VARIABLES
//===================

//var SERVER = "http://192.168.10.139:3000";  // Local
var SERVER = "http://demo.tocticket.com";  // Demo
//var SERVER = "http://www.tocticket.com";  // Production

var API = {
    get_token: SERVER + "/api/v1/tokens",
    events: function() {
        return SERVER + "/api/v1/events?auth_token=" + token;
    },
    check_ticket: function() {
        return SERVER + "/api/v1/check_ticket?auth_token=" + token;
    }
};

var token = null;
var selected_event = null;

// INIT
//=======
$(document).ready(function() {
    render_partial("login", signing_in);
});

// PAGINATION
//=============
function render_partial(template, callback) {
    $.get("templates/_" + template + ".html", function(template) {
        $("#content").html(template);
        if (callback != undefined) {
            callback();
        }
    });

};

// ACTIONS
//===========
var signing_in = function() {
    $("form").submit(function(e) {
        e.preventDefault();
        var credentials = "email=" + $("#username").val() + "&password=" + $("#password").val();
        $("#loading").show();
        $.ajax({
            type: "POST",
            url: API.get_token,
            dataType: "json",
            data: credentials,
            async: false,
            success: function (data){
                $("#loading").hide();
                token = data.token;
                render_partial("events", listing_events);
            },
            error: function(xhr, ajaxOptions, thrownError) {
                $("#loading").hide();
                var message = (xhr.responseText==undefined)? xhr.statusText : $.parseJSON(xhr.responseText).message;
                $("form .alert-error").html(message).show();
            }
        });
    });
};

var listing_events = function() {
    // List events
    $("#loading").show();
    $.ajax({
        type: "GET",
        url: API.events(),
        dataType: "json",
        async: false,
        success: function (data){
            $("#loading").hide();
            $.each(data, function(i, event) {
                var text = (event.name.length >30)? event.name.substr(0,30) + "...": event.name;
                $('<button>', {
                    text: text,
                    class: 'btn btn-block',
                    type: 'button',
                    'data-id': event.id
                }).appendTo('#events');
            })
        },
        error: function(xhr, ajaxOptions, thrownError) {
            $("#loading").hide();
            var message = (xhr.responseText==undefined)? xhr.statusText : $.parseJSON(xhr.responseText).message;
            $("#events .alert-error").html(message).show();
        }
    });

    // Click action for each event
    $(document).on("click", "#events .btn", function(e) {
        selected_event = $(this).data("id");
        scanning_code();
    });
};

var scanning_code = function () {
    window.plugins.barcodeScanner.scan(
        function (result) {
            if (result.cancelled) {
                render_partial("events", listing_events);
            } else {
                render_partial("ticket");
                // Checking Ticket
                var qr_array = result.text.split("/");
                var ticket_req = "event=" + selected_event + "&ticket=" + qr_array[0] + "&key=" + qr_array[1]
                $("#loading").show();
                $.ajax({
                    type: "POST",
                    url: API.check_ticket(),
                    dataType: "json",
                    data: ticket_req,
                    success: function (data){
                        $("#loading").hide();
                        ticket = data;
                        $("#ticket .alert-success").html("Valid Ticket.").show();
                        $('<p>', {
                            text: "Attendees: " + ticket.attendees
                        }).appendTo('#ticket .detail');
                        $('<p>', {
                            text: "Email: " + ticket.email
                        }).appendTo('#ticket .detail');
                    },
                    error: function(xhr, ajaxOptions, thrownError) {
                        $("#loading").hide();
                        var message = (xhr.responseText==undefined)? xhr.statusText : $.parseJSON(xhr.responseText).message;
                        $("#ticket .alert-error").html(message).show();
                    }
                });
                // Back to scan button
                $(document).on("click", "#ticket .btn", function(e) {
                    scanning_code();
                });
            }
        }, function (error) {
            alert("Scan failed: " + error);
        });
};