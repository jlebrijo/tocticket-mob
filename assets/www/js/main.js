var SERVER = "http://192.168.10.139:3000";
var API = {
    get_token: SERVER + "/api/v1/tokens.json",
    events: function() {
        return SERVER + "/api/v1/events.json?auth_token=" + token;
    }
};

var token = null;
var selected_event = null;


var scanCode = function () {
    window.plugins.barcodeScanner.scan(
        function (result) {
            if (!result.cancelled) {

            }


            alert("Scanned Code: " + result.text
                + ". Format: " + result.format
                + ". Event: " + selected_event
                + ". Cancelled: " + result.cancelled);
        }, function (error) {
            alert("Scan failed: " + error);
        });
};

function render_partial(template, callback) {
    $.get("templates/_" + template + ".html", function(template) {
        $("body").html(template);
        if (callback != undefined) {
            callback();
        }
    });

};

var signing_in = function() {
    $("form").submit(function(e) {
        e.preventDefault();
        credentials = "email=" + $("#username").val() + "&password=" + $("#password").val();
        $.ajax({
            type: "POST",
            url: API.get_token,
            dataType: "json",
            data: credentials,
            success: function (data){
                token = data.token;
                render_partial("events", listing_events);
            },
            error: function(xhr, ajaxOptions, thrownError) {
                $("form .alert").html($.parseJSON(xhr.responseText).message).show();
            }
        });
    });
};

var listing_events = function() {
    // List events
    $.ajax({
        type: "GET",
        url: API.events(),
        dataType: "json",
        success: function (data){
            $.each(data, function(i, event) {
                $("#events").append()
                $('<button>', {
                    text: event.name,
                    class: 'btn',
                    type: 'button',
                    'data-id': event.id
                }).appendTo('#events')
            })
        },
        error: function(xhr, ajaxOptions, thrownError) {
            $("form .alert").html($.parseJSON(xhr.responseText).message).show();
        }
    });

    // Click action for each event
    $(document).on("click", "#events .btn", function(e) {
        selected_event = $(this).data("id");
        scanCode();
    });
}
$(document).ready(function() {
    render_partial("login", signing_in);
});




