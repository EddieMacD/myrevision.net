function submitUser () {
    try {
        clearStatusBar();

        var api = apiRoot + "/new-user";

        var postBody = {};
        postBody.email = getEmail();
        postBody.school = getSchool();
        postBody.firstName = getFirstName();
        postBody.lastName = getLastName();
        postBody.DOB = getDOB();
        postBody.accessLevel = getAccessLevel();

        await callPostAPI(api, postBody, "a user", false);

        generateSuccessBar("User " + postBody.firstName + " created. An email has been sent to " + postBody.email + " inviting them to myrevision.net");
    } catch {

    }
}

function getEmail() {
    return $("#email-input").val();
}

async function getSchool() {
    //if (userSession.auth.accessLevel == "admin") {

    //} else {
        var api = apiRoot + "/"


        return callGetAPI(); 
    //}
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
    return $("access-level-input").val();
}