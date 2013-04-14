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
}

var token = null;


$(document).ready(function(){
    $.get("templates/_login.html", function(template) {
        $("body").html(template);
        $("form").submit(function(e){
            e.preventDefault();
            credentials = "email=" + $("#username").val() + "&password=" + $("#password").val();
            $.ajax({
                type: "POST",
                url: "http://192.168.10.139:3000/api/v1/tokens.json",
                dataType: "json",
                data: credentials,
                success: function (data){
                    token = data.token;
                    $.get("templates/_events.html", function(template) {
                            $("body").html(template);
                    });
                },
                error: function(xhr, ajaxOptions, thrownError) {
                    $("form .alert").html($.parseJSON(xhr.responseText).message).show();
                }
            });
        });
    });

});




