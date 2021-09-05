async function getUserSchool () {
    switch (userSession.auth.accessLevel) {
        case "teacher": 
            await getTeacherSchool();
            break;

        case "admin": 
            await getAllSchools();
            break;
        
        default:
            window.location.replace(baseURL + "/student-home");
            break;
    }

    getUserPage(0);
}

async function getTeacherSchool () {
    try {
        var api = apiRoot + "/user-school?email=" + userSession.auth.email;

        var school = await callGetAPI(api, "your school");

        $("#school-select").append(newSelectItem(school));

        $("#school-input-container").hide();
    } catch (e) {
        generateErrorBar(e);
    }
}

async function getAllSchools () {
    try {
        var api = apiRoot + "/all-schools?username=" + userSession.auth.username;
        var schoolData = await callGetAPI(api, "schools");
        schoolData = schoolData.schools;

        var schools = [];

        schoolData.forEach(element => {
            schools.push(element[0].stringValue);
        });

        //schools.join();
        schools.sort();

        schools.forEach(element => {
            $("#school-select").append(newSelectItem(element));
        });

        $("#school-input-container").show();
    } catch (e) {
        generateErrorBar(e);
    }
}

//Compiles a string containing a select item with corresponding text and value
///text: The label and the value of the option
function newSelectItem(text) {
    //String compilation
    ///Correctly formats HTML to be appended to the input box, returned at the end of the function
    var option = "<option value='" + text + "'>" + text + "</option>";

    return option
}

async function submitUser () {
    try {
        clearStatusBar();

        var api = apiRoot + "/new-user";

        var postBody = {};
        postBody.senderUsername = userSession.auth.username;
        postBody.email = getEmail();
        postBody.school = getSchool();
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

function getSchool() {
    return $("#school-select").val();
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

async function getUserPage(offset) {
    var pageSize = 10;
    var api = apiRoot + "/user-page?school=" + getSchool() + "&offset=" + offset + "&amount=" + pageSize;

    var data = await callGetAPI(api, "user data");

    data.forEach((element, index) => {
        var user = {};
        user.firstName = element[0].stringValue;
        user.lastName = element[1].stringValue;
        user.email = element[2].stringValue;
        user.dob = element[3].stringValue;
        user.accessLevel = element[4].stringValue;

        $("#frm-delete-user-page").append(generateDeleteRow(user, index));
    })
}

function generateDeleteRow(user, index) {
    var userRow = [];

    userRow.push(
        '<div class="row user-row" id="user-row-' + index + '">',
            '<div class="col-xs-2">' + user.firstName + '</div>',
            '<div class="col-xs-2">' + user.lastName + '</div>',
            '<div class="col-xs-4">' + user.email + '</div>',
            '<div class="col-xs-2">' + user.dob + '</div>',
            '<div class="col-xs-1">' + user.accessLevel + '</div>',
            '<div class="col-xs-1">',
                '<button type="button" class="btn btn-delete" onclick="deleteUser(' + index + ')"><i class="ion-close-round"></i></button>',
            '</div>',
        '</div>'
    );

    return userRow.join("");
}

function deleteUser(index) {

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