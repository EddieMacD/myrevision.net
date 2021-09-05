var onContctUsSubmit = function() {
    $(document).ready(function() {
        console.log('Sending message...')
        $(".results_thanks").hide();            
        $(".results_errors").hide();
        if ($("#contact-us-form input[name='name']").val() === "" ||
            $("#contact-us-form input[name='email']").val() === "") {
            $(".results_errors").show();
            $("#contact-us-form button").show();
        } else {
            $(".results_errors").hide();
            $.post('https://api.soft-practice.com/contact', JSON.stringify({
                name: $("#contact-us-form input[name='name']").val(),
                email: $("#contact-us-form input[name='email']").val(),
                subject: $("#contact-us-form input[name='subject']").val(),
                message: $("#contact-us-form textarea[name='message']").val(),
                recaptcha_response: $("#contact-us-form textarea[name='g-recaptcha-response']").val()
            }), function(data) {
                $(".results_sending").hide();
                $(".results_thanks").show();
                $("#contact-us-form button").hide();
                $("#contact-us-form input[name='name']").val('');
                $("#contact-us-form input[name='email']").val('');
                $("#contact-us-form input[name='subject']").val('');
                $("#contact-us-form textarea[name='message']").val('');
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
            $(".results_sending").show();
            $("#contact-us-form button").hide();                
        });
    });

    hideLoader();

    adaptHeaderBar("guest");
}