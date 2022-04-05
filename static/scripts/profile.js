//Sets a user's email to the change email input box
function setUserEmail() {
    //Sets a user's email to the change email input box
    $("#change-email-input").val(userSession.auth.email);
}

//Allows a user to edit the change email box and allows submission of a new email.
function editEmail() {
    clearStatusBar();

    //Page changes
    ///Hide the edit email button
    $("#btn-email-edit").hide();

    ///Disable the edit email button
    $("#btn-email-edit").attr("disabled", "disabled");

    ///Show the submit email button
    $("#btn-email-submit").show();

    ///Enable the submit email button
    $("#btn-email-submit").removeAttr("disabled");

    ///Enable the input box for changing email
    $("#change-email-input").removeAttr("disabled");
}

//Changes a user's email by submitting their requested change to the serverside systems
async function submitEmail() {
    try {
        clearStatusBar();

        //Variables
        ///The user's new email choice, taken from the input box
        var newEmail = $("#change-email-input").val();

        ///The api used to change the user's email, sending the user's username and their email
        var api = apiRoot + "/user/change-email?username=" + userSession.auth.username + "&newEmail=" + newEmail;


        //API Call
        ///Calls the api to change the email
        await callGetAPI(api, "email", false);


        //Edit Page
        ///Show the edit email button
        $("#btn-email-edit").show();

        ///Enables the edit email button
        $("#btn-email-edit").removeAttr("disabled");

        ///Hide the submit a new email button
        $("#btn-email-submit").hide();

        ///Disable the submit a new email button
        $("#btn-email-submit").attr("disabled", "disabled");

        ///Disable the submit email input box
        $("#change-email-input").attr("disabled", "disabled");

        ///Generate a success bar, telling the user that their email was changed
        generateSuccessBar("Your email was successfully changed");

        //Data handling
        ///Set the user's email to the new email, both in the active data and in the session storage 
        userSession.auth.email = newEmail;
        sessionStorage.setItem("auth", JSON.stringify(userSession.auth));
    } catch (e) {
        //Reset the page and generate an error bar
        editEmail();
        generateErrorBar(e);
    }
}

//Allows a user to edit their password
function editPassword() {
    clearStatusBar();

    //Page Changes
    ///Hide the edit password button
    $("#btn-password-edit").hide();

    ///Disable the edit password button
    $("#btn-password-edit").attr("disabled", "disabled");

    ///Show the submit password button
    $("#btn-password-submit").show();

    ///Enable the submit password button
    $("#btn-password-submit").removeAttr("disabled");

    ///Enable the password input box
    $("#change-password-input").removeAttr("disabled");

    ///Empty the edit password box from the ten * chars
    $("#change-password-input").val("");
}

//Changes a user's password by submitting their requested change to the serverside systems
async function submitPassword () {
    try {
        clearStatusBar();

        //Variables
        ///The user's new password choice, taken from the input box
        var newPassword = $("#change-password-input").val();

        ///The api used to change the user's password, sending the user's username and their password
        var api = apiRoot + "/user/change-password?username=" + userSession.auth.username + "&newPassword=" + newPassword;


        //API Call
        ///Calls the api to change the password
        await callGetAPI(api, "password", false);


        //Edit Page
        ///Show the edit password button
        $("#btn-password-edit").show();

        ///Enables the edit password button
        $("#btn-password-edit").removeAttr("disabled");

        ///Hide the submit a new password button
        $("#btn-password-submit").hide();

        ///Disable the submit a new password button
        $("#btn-password-submit").attr("disabled", "disabled");

        ///Disable the submit password input box
        $("#change-password-input").attr("disabled", "disabled");

        ///Fills the edit password box with ten * characters - passwords are not stored clientside
        $("#change-password-input").val("**********");

        ///Generate a success bar, telling the user that their empasswordail was changed
        generateSuccessBar("Your password was successfully changed");
    } catch (e) {
        //Reset the page and generate an error bar
        editPassword();
        generateErrorBar(e);
    }
}

//Runs when the code loads - the timeout buffers until the full page loads
///Runs the initialise function in case more than one function call is needed
window.onload = function(){
    setTimeout(initialise, 1);
};
 
//Runs when the page loads
async function initialise(){
    //Loader set
    ///The loader is visible when the page is loaded - sets the loader value accordingly
    userSession.loaderVal = 1;
 
    //Function calls
    ///Initialise the user
    await initialiseAuth(); 

    ///Sets up the user email for changing
    setUserEmail();
}