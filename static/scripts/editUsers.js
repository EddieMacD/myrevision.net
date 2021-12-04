//Handles the what school data to retrieve
async function getUserSchool () {
    //Select School
    ///Switches based on a user's access level
    switch (userSession.auth.accessLevel) {
        case "teacher": 
            ///If the user is a teacher then get their school
            await getTeacherSchool();
            break;

        case "admin": 
            ///If the user is an admin then get all schools
            await getAllSchools();
            break;
        
        default:
            ///If the user is not a teacher or an admin then direct them to the student home page
            window.location.replace(baseURL + "/student-home");
            break;
    }

    //Get the first page of users 
    getUserPage(0);
}

//Gets the school of a teacher user
async function getTeacherSchool () {
    try {
        //Get School
        ///The api to call to get the user's school, complete with query string parameters
        var api = apiRoot + "/user-school?email=" + userSession.auth.email;

        ///Getting the school via api call
        var school = await callGetAPI(api, "your school");

        ///Put the school into the school select box
        $("#school-select").append(newSelectItem(school));

        ///Hide the school select box - only for admins
        $("#school-input-container").hide();
    } catch (e) {
        generateErrorBar(e);
    }
}

//Gets all of the schools
async function getAllSchools () {
    try {
        //Get Schools
        ///The api to get the schools, complete with query string parameters
        var api = apiRoot + "/all-schools?username=" + userSession.auth.username;

        ///Using an API call to retrieve the school data
        var schoolData = await callGetAPI(api, "schools");

        ///Parsing the school data
        schoolData = schoolData.schools;

        ///An array to store the schools
        var schools = [];

        ///Populating the schools array with the schools from the back end
        schoolData.forEach(element => {
            schools.push(element[0].stringValue);
        });

        ///Sorting the school array
        schools.sort();

        ///Adding each school to the 
        schools.forEach(element => {
            $("#school-select").append(newSelectItem(element));
        });

        ///Show the school select box
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

//Submits the data for a new user
async function submitUser () {
    try {
        clearStatusBar();

        //Variables
        ///The api to be called in order to add a new user
        var api = apiRoot + "/new-user";

        ///The post body for creating a user, with all of the required information
        var postBody = {};
        postBody.senderUsername = userSession.auth.username;
        postBody.email = getEmail();
        postBody.school = getSchool();
        postBody.firstName = getFirstName();
        postBody.lastName = getLastName();
        postBody.DOB = getDOB();
        postBody.accessLevel = getAccessLevel();

        ///Calling the API to create a user
        await callPostAPI(api, postBody, "a user", false);

        ///Show the user that success has been had
        generateSuccessBar("User " + postBody.firstName + " " + postBody.lastName +  " created. An email has been sent to " + postBody.email + " inviting them to myrevision.net");
    } catch (e) {
        generateErrorBar(e);
    }
}

//Get the new user's email from the user input box
function getEmail() {
    return $("#email-input").val();
}

//Get the new user's school from the school select box (hidden for teachers since they can only add to their own school)
function getSchool() {
    return $("#school-select").val();
}

//Get the user's first name from the user input box
function getFirstName() {
    return $("#first-name-input").val();
}

//Get the user's last name from the user input box
function getLastName() {
    return $("#last-name-input").val();
}

//Get the user's Date Of Birth from the user input box
function getDOB() {
    return $("#dob-input").val();
}

//Get the user's access level from the select box
function getAccessLevel() {
    return $("#access-level-input").val();
}

//Get a page of users for the delete user portion of the page
///offset: how many items have been on previous pages
async function getUserPage(offset) {
    try {
        //Get User Page
        ///Clear the current user page
        $("#frm-delete-user-page").empty();

        ///Get the page size from the select box
        var pageSize = $("#frm-delete-user-page-num").val();

        ///Set the offset to the user session object
        userSession.pageOffset = offset;

        ///The URI for the API to get a user page, complete with query string parameters
        var api = apiRoot + "/user-page?school=" + getSchool() + "&offset=" + offset + "&amount=" + pageSize;

        ///The API call to get the user page
        var data = await callGetAPI(api, "user data");

        userSession.numOfUsers = data.count;

        //Displaying User Page
        ///For each user in the page
        data.userPage.forEach((element, index) => {
            ///Add their data to an object - converting it into a form that the function can handle
            var user = {};
            user.firstName = element[0].stringValue;
            user.lastName = element[1].stringValue;
            user.email = element[2].stringValue;
            user.dob = element[3].stringValue;
            user.accessLevel = element[4].stringValue;

            ///Append a delete user row containing their information to the delete user page
            $("#frm-delete-user-page").append(generateDeleteRow(user, index));
        });

        ///Generate the page markers to go on the bottom of the delete page
        generatePageMarkers(data.count, offset/pageSize);

        ///If this is the first page
        if(offset <= 0){
            ///Disable the previous page button
            $(".btn-prev").attr("disabled", "disabled");
        } else {
            ///If this is not the first page make sure the previous page button is enabled
            $(".btn-prev").removeAttr("disabled");
        }
    
        ///If this is the last page
        if(offset + pageSize >= data.count){
            ///Disable the next page button
            $(".btn-next").attr("disabled", "disabled");
        } else {
            ///If this is not the last page make sure the next page button is enabled
            $(".btn-next").removeAttr("disabled");
        }

    } catch (e) {
        generateErrorBar(e);
    }
}

//Generate a delete user row for the user page
///user: the data of the user to be displayed on the row
///index: the number of the user on the page
function generateDeleteRow(user, index) {
    //Generate User Row
    ///Array to store each line of the row - concatenated and returned at the end of the function
    var userRow = [];

    ///Push the delete row to the array
    userRow.push(
        '<div class="row user-row" id="user-row-' + index + '">',
            ///Contains a user's first name, last name, email, date of birth and access level
            '<div class="col-xs-2" id="user-first-name-' + index + '">' + user.firstName + '</div>',
            '<div class="col-xs-2" id="user-last-name-' + index + '">' + user.lastName + '</div>',
            '<div class="col-xs-4" id="user-email-' + index + '">' + user.email + '</div>',
            '<div class="col-xs-2" id="user-dob-' + index + '">' + user.dob + '</div>',
            '<div class="col-xs-1" id="user-access-level' + index + '">' + user.accessLevel + '</div>',
            ///Also contains a button that allows the viewer to delete this user
            '<div class="col-xs-1">',
                '<button type="button" class="btn btn-delete" onclick="deleteUser(' + index + ')"><i class="ion-close-round"></i></button>',
            '</div>',
        '</div>'
    );

    return userRow.join("");
}

//Changes the user page by + or - 1
///Change: how many pages to change by
function newUserPage(change) {
    //Variables
    ///The number of users on a page, determined by a select box
    var pageSize = $("#frm-delete-user-page-num").val();

    ///How many users to change by
    var changeBy = pageSize * change;

    ///How many users are now in previous pages
    var offset = userSession.pageOffset + changeBy;


    //Change page
    ///If the new offset is a valid number
    if(offset >= 0 || offset <= userSession.numOfUsers){
        ///Change the user page
        getUserPage(offset);    
    }
}

//Sets the user page to a new page
///pageNumber: the number of the page you are now changing to
function setUserPage(pageNumber) {
    //Variables
    ///The number of users on a page, determined by a select box
    var pageSize = $("#frm-delete-user-page-num").val();

    ///The number of users now on previous pages
    var offset = pageSize * pageNumber;


    //Change Page
    ///If the new offset is a valid number
    if(offset >= 0 || offset <= userSession.numOfUsers){
        ///Change the user page
        getUserPage(offset);    
    }
}

//Generates the page markers that go underneath the delete page
///numOfItems: how many users there are for the current school
///currentPage: which page is currently selected
function generatePageMarkers (numOfItems, currentPage) {
    //Generate Page Markers
    ///Empty out the current page marker row
    $("#page-markers").empty();

    ///The number of users on a page, determined by a select box
    var pageSize = $("#frm-delete-user-page-num").val();

    ///How many markers to generate - truncated by parse int so one is added if there are extraneous users
    var numOfMarkers = parseInt(numOfItems / pageSize);

    if(numOfItems % pageSize != 0) {
        numOfMarkers++;
    }

    ///For the number of markers that need to be generated
    for(var i = 0; i < numOfMarkers; i++)
    {
        ///If it is the currently selected page
        if(i === currentPage) {
            ///Append a selected page marker
            $("#page-markers").append('<a class="page-marker-selected">' + i + '</a>');
        } else {     
            ///If it is not the currently selected page append a normal page marker
            $("#page-markers").append('<a class="page-marker" onclick="setUserPage(' + i + ')">' + i + '</a>');
        }
    }
}

//Deletes a user
///index: the number of the user in the delete user page
async function deleteUser(index) {
    try {
        clearStatusBar();

        //Delete User
        ///The URI of the api to delete a user, compelete with all of the relevant parameters
        var api = apiRoot + "/delete-user?deletedEmail=" + $("#user-email-" + index).text() + "&school=" + getSchool() + "&senderUsername=" + userSession.auth.username;
        
        ///Calling the API to delete a user
        await callGetAPI(api, "user data");

        ///Show the user that the deletion was successful
        generateSuccessBar("User " + $("#user-first-name-" + index).text() + " " + $("#user-last-name-" + index).text() + " has been deleted")

        ///Regenerate the user page to reflect the deleted user
        setUserPage(userSession.pageOffset);
    } catch (e) {
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

    //Gets the current user's school
    getUserSchool();
}