function setUserEmail() {
    $("#change-email-input").val(userSession.auth.email);
}

function editEmail() {
    clearStatusBar();

    $("#btn-email-edit").hide();
    $("#btn-email-edit").attr("disabled", "disabled");

    $("#btn-email-submit").show();
    $("#btn-email-submit").removeAttr("disabled");

    $("#change-email-input").removeAttr("disabled");
}

async function submitEmail() {
    try {
        clearStatusBar();

        var newEmail = $("#change-email-input").val();
        var api = apiRoot + "/change-email?username=" + userSession.auth.username + "&newEmail=" + newEmail;

        await callGetAPI(api, "email", false);

        $("#btn-email-edit").show();
        $("#btn-email-edit").removeAttr("disabled");

        $("#btn-email-submit").hide();
        $("#btn-email-submit").attr("disabled", "disabled");

        $("#change-email-input").attr("disabled", "disabled");

        generateSuccessBar("Your email was successfully changed");
        userSession.auth.email = newEmail;
        sessionStorage.setItem("auth", JSON.stringify(userSession.auth));
    } catch (e) {
        editEmail();
        generateErrorBar(e);
    }
}

function editPassword() {
    clearStatusBar();

    $("#btn-password-edit").hide();
    $("#btn-password-edit").attr("disabled", "disabled");

    $("#btn-password-submit").show();
    $("#btn-password-submit").removeAttr("disabled");

    $("#change-password-input").removeAttr("disabled");
    $("#change-password-input").val("");
}

async function submitPassword () {
    try {
        clearStatusBar();

        var newPassword = $("#change-password-input").val();
        var api = apiRoot + "/change-password?username=" + userSession.auth.username + "&newPassword=" + newPassword;

        await callGetAPI(api, "password", false);

        $("#btn-password-edit").show();
        $("#btn-password-edit").removeAttr("disabled");

        $("#btn-password-submit").hide();
        $("#btn-password-submit").attr("disabled", "disabled");

        $("#change-password-input").attr("disabled", "disabled");
        $("#change-password-input").val("**********");

        generateSuccessBar("Your password was successfully changed");
    } catch (e) {
        editPassword();
        generateErrorBar(e);
    }
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