function setUserEmail() {
    $("#change-email-input").val(userSession.auth.email);
}

function editEmail() {
    $("#btn-email-edit").hide();
    $("#btn-email-edit").attr("disabled", "disabled");

    $("#btn-email-submit").show();
    $("#btn-email-submit").removeAttr("disabled");

    $("#change-email-input").removeAttr("disabled");
}

function submitEmail() {

}

function editPassword() {
    $("#btn-password-edit").hide();
    $("#btn-password-edit").attr("disabled", "disabled");

    $("#btn-password-submit").show();
    $("#btn-password-submit").removeAttr("disabled");

    $("#change-password-input").removeAttr("disabled");
    $("#change-password-input").val("");
}

function submitPassword () {

}

//Runs when the code loads - the timeout buffers until the full page loads
///Runs the initialise function in case more than one function call is needed
window.onload = function(){
    setTimeout(initialise(), 1);
};
 
//Runs when the page loads
async function initialise(){
    userSession.loaderVal = 1;
 
    //Function calls
    await initialiseAuth(); 

    setUserEmail();
}