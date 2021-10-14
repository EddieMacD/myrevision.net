var onContctUsSubmit = function() {
    $(document).ready(function() {
        console.log('Sending message...')
        if ($("#contact-us-form input[name='name']").val() === "" ||
            $("#contact-us-form input[name='email']").val() === "") {
            $("#contact-us-form button").show();

            generateErrorBar("There was an error contacting us. Please check your information and your internet connection and try again later.");
        } else {
            $.post(apiRoot + "/contact-us", JSON.stringify({
                name: $("#contact-us-form input[name='name']").val(),
                email: $("#contact-us-form input[name='email']").val(),
                subject: $("#contact-us-form input[name='subject']").val(),
                message: $("#contact-us-form textarea[name='message']").val(),
                recaptcha_response: $("#contact-us-form textarea[name='g-recaptcha-response']").val()
            }), function(data) {
                $("#contact-us-form button").hide();
                $("#contact-us-form input[name='name']").val('');
                $("#contact-us-form input[name='email']").val('');
                $("#contact-us-form input[name='subject']").val('');
                $("#contact-us-form textarea[name='message']").val('');

                generateSuccessBar("Thanks! We'll get back to you soon.");
            }, 'json');
        }
    });
};     
   
window.onload = function(){
    setTimeout(initialise(), 1);
};
 
//Runs when the page loads
function initialise(){
    userSession.loaderVal = 1;

    $(document).ready(function() {
        $("#contact-us-form button").click(function(event) {
            clearStatusBar();
            showLoader();
            $("#contact-us-form button").hide();                
        });
    });

    hideLoader();

    adaptHeaderBar("guest");
}