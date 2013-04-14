var SERVER = "http://192.168.10.139:3000";
var API = {
    get_token: SERVER + "/api/v1/tokens.json"
};

var token = null;


var scanCode = function () {
    window.plugins.barcodeScanner.scan(
        function (result) {
            if (!result.cancelled) {

            }


            alert("Scanned Code: " + result.text
                + ". Format: " + result.format
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

$(document).ready(function(){
    render_partial("login", function() {
        $("form").submit(function(e){
            e.preventDefault();
            credentials = "email=" + $("#username").val() + "&password=" + $("#password").val();
            $.ajax({
                type: "POST",
                url: API.get_token,
                dataType: "json",
                data: credentials,
                success: function (data){
                    token = data.token;
                    render_partial("events");
                },
                error: function(xhr, ajaxOptions, thrownError) {
                    $("form .alert").html($.parseJSON(xhr.responseText).message).show();
                }
            });
        });
    });

});




