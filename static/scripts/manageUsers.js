async function getUserSchool () {
    try {
        var api = apiRoot + "/user-school?email=" + userSession.auth.email;

        userSession.school = await callGetAPI(api, "your school");
        userSession.school = userSession.school.school;
    } catch (e) {
        generateErrorBar(e);
    }
}

async function submitUser () {
    try {
        clearStatusBar();

        var api = apiRoot + "/new-user";

        var postBody = {};
        postBody.senderUsername = userSession.auth.username;
        postBody.email = getEmail();
        postBody.school = "Admin Group"; //getSchool();
        postBody.firstName = getFirstName();
        postBody.lastName = getLastName();
        postBody.DOB = getDOB();
        postBody.accessLevel = getAccessLevel();

        await callPostAPI(api, postBody, "a user", false);

        generateSuccessBar("User " + postBody.firstName + " " + postBody.lastName +  " created. An email has been sent to " + postBody.email + " inviting them to myrevision.net");
    } catch (e) {
        generateErrorBar(e);
    }
}

function getEmail() {
    return $("#email-input").val();
}

async function getSchool() {
    return userSession.school;
}

function getFirstName() {
    return $("#first-name-input").val();
}

function getLastName() {
    return $("#last-name-input").val();
}

function getDOB() {
    return $("#dob-input").val();
}

function getAccessLevel() {
    return $("#access-level-input").val();
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

    getUserSchool();
 }