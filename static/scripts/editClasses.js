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

    getClasses();
}

//Gets the school of a teacher user
async function getTeacherSchool () {
    try {
        //Get School
        ///The api to call to get the user's school, complete with query string parameters
        var api = apiRoot + "/user/school?email=" + userSession.auth.email;

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

//Submits the data for a new class
async function submitClass () {
    try {
        clearStatusBar();

        var className = getClassName();
        var classSubject = getClassSubject();

        //Variables
        ///The api to be called in order to add a new user
        var api = apiRoot + "/class/create?className=" + className + "&classSubject=" + classSubject + "&targetSchool=" + getSchool() + "&senderUsername=" + userSession.auth.username;

        ///Calling the API to create a class
        await callGetAPI(api, "a class", false);

        await getClasses();

        ///Show the user that success has been had
        generateSuccessBar("The class " + className + " for " + classSubject +  " has been created.");
    } catch (e) {
        generateErrorBar(e);
    }
}

//Get the new user's school from the school select box (hidden for teachers since they can only add to their own school)
function getSchool() {
    return $("#school-select").val();
}

//Get the new user's email from the user input box
function getClassName() {
    return $("#class-name-input").val();
}

//Get the user's first name from the user input box
function getClassSubject() {
    return $("#topic-input").val();
}

function getClassID() {
    return $("#class-name-select").val();
}

async function getClasses() {
    try {
        var api = apiRoot + "/class/recall?school=" + getSchool();

        var classData = await callGetAPI(api, "classes");

        classData = classData.userClasses;

        if(classData != false) {
            $("#class-name-select").empty();

            classData.forEach((element) => {
                $("#class-name-select").append(newSelectItemValue(element[1].stringValue, element[0].longValue))
            })

            $("#edit-class-container").show();

            userSession.addPageOffset = 0;
            userSession.removePageOffset = 0;

            setUserPages();
            getTopic();
        } else {
            $("#edit-class-container").hide();
        }
    } catch (e) {
        generateErrorBar(e);
    }
}

//Compiles a string containing a select item with corresponding text and value, with a different text and value
///text: The label of the option
///value: The value of the option
function newSelectItemValue(text, value) {
    //String compilation
    ///Correctly formats HTML to be appended to the input box, returned at the end of the function
    var option = "<option value='" + value + "'>" + text + "</option>";

    return option
}

//Get a page of users for the delete user portion of the page
///offset: how many items have been on previous pages
async function getAddUserPage(offset) {
    try {
        //Get User Page
        ///Clear the current user page
        $("#frm-add-user-page").empty();

        ///Get the page size from the select box
        var pageSize = $("#frm-add-user-page-num").val();

        ///Set the offset to the user session object
        userSession.addPageOffset = offset;

        ///The URI for the API to get a user page, complete with query string parameters
        var api = apiRoot + "/class/user-page?school=" + getSchool() + "&classID=" + getClassID() + "&offset=" + offset + "&amount=" + pageSize + "&pageType=add";

        ///The API call to get the user page
        var data = await callGetAPI(api, "user data");

        if(data.length > 0) {
            $("#add-to-class-container").show();

            userSession.addUserNum = data.count;

            //Displaying User Page
            ///For each user in the page
            data.userPage.forEach((element, index) => {
                ///Add their data to an object - converting it into a form that the function can handle
                var user = {};
                user.ID = element[0].longValue;
                user.firstName = element[1].stringValue;
                user.lastName = element[2].stringValue;
                user.accessLevel = element[3].stringValue;

                ///Append a delete user row containing their information to the delete user page
                $("#frm-add-user-page").append(generateAddUserRow(user, index));
            });

            ///Generate the page markers to go on the bottom of the delete page
            generateAddPageMarkers(data.count, offset/pageSize);

            ///If this is the first page
            if(offset <= 0){
                ///Disable the previous page button
                $("#add-btn-prev").attr("disabled", "disabled");
            } else {
                ///If this is not the first page make sure the previous page button is enabled
                $("#add-btn-prev").removeAttr("disabled");
            }
        
            ///If this is the last page
            if(offset + pageSize >= data.count){
                ///Disable the next page button
                $("#add-btn-next").attr("disabled", "disabled");
            } else {
                ///If this is not the last page make sure the next page button is enabled
                $("#add-btn-next").removeAttr("disabled");
            }
        } else {
            $("#add-to-class-container").hide();
        }

    } catch (e) {
        generateErrorBar(e);
    }
}

//Generate a delete user row for the user page
///user: the data of the user to be displayed on the row
///index: the number of the user on the page
function generateAddUserRow(user, index) {
    //Generate User Row
    ///Array to store each line of the row - concatenated and returned at the end of the function
    var userRow = [];

    ///Push the delete row to the array
    userRow.push(
        '<div class="row user-row">',
            ///Contains a user's first name, last name, email, date of birth and access level
            '<div class="col-xs-4" id="add-user-first-name-' + index + '">' + user.firstName + '</div>',
            '<div class="col-xs-4" id="add-user-last-name-' + index + '">' + user.lastName + '</div>',
            '<div class="col-xs-3" id="add-user-access-level-' + index + '">' + user.accessLevel + '</div>',
            ///Also contains a button that allows the viewer to delete this user
            '<div class="col-xs-1">',
                '<button type="button" class="btn btn-add" onclick="addUserToClass(' + index + ', ' + user.ID + ')"><i class="ion-plus-round"></i></button>',
            '</div>',
        '</div>'
    );

    return userRow.join("");
}

//Changes the user page by + or - 1
///Change: how many pages to change by
function newAddUserPage(change) {
    //Variables
    ///The number of users on a page, determined by a select box
    var pageSize = $("#frm-add-user-page-num").val();

    ///How many users to change by
    var changeBy = pageSize * change;

    ///How many users are now in previous pages
    var offset = userSession.addPageOffset + changeBy;


    //Change page
    ///If the new offset is a valid number
    if(offset >= 0 || offset <= userSession.addUserNum){
        ///Change the user page
        getAddUserPage(offset);    
    }
}

//Sets the user page to a new page
///pageNumber: the number of the page you are now changing to
function setAddUserPage(pageNumber) {
    //Variables
    ///The number of users on a page, determined by a select box
    var pageSize = $("#frm-add-user-page-num").val();

    ///The number of users now on previous pages
    var offset = pageSize * pageNumber;


    //Change Page
    ///If the new offset is a valid number
    if(offset >= 0 || offset <= userSession.addUserNum){
        ///Change the user page
        getAddUserPage(offset);    
    }
}

//Generates the page markers that go underneath the delete page
///numOfItems: how many users there are for the current school
///currentPage: which page is currently selected
function generateAddPageMarkers (numOfItems, currentPage) {
    //Generate Page Markers
    ///Empty out the current page marker row
    $("#add-page-markers").empty();

    ///The number of users on a page, determined by a select box
    var pageSize = $("#frm-add-user-page-num").val();

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
            $("#add-page-markers").append('<a class="page-marker-selected">' + i + '</a>');
        } else {     
            ///If it is not the currently selected page append a normal page marker
            $("#add-page-markers").append('<a class="page-marker" onclick="setAddUserPage(' + i + ')">' + i + '</a>');
        }
    }
}

//Deletes a user
///index: the number of the user in the delete user page
async function addUserToClass(index, userID) {
    try {
        clearStatusBar();

        //Delete User
        ///The URI of the api to delete a user, compelete with all of the relevant parameters
        var api = apiRoot + "/class/create-link?senderUsername=" + userSession.auth.username + "&classID=" + getClassID() + "&userID=" + userID;
        
        ///Calling the API to delete a user
        await callGetAPI(api, "user data");

        ///Show the user that the deletion was successful
        generateSuccessBar("User " + $("#add-user-first-name-" + index).text() + " " + $("#add-user-last-name-" + index).text() + " has been added to class " + $( "#class-name-select option:selected" ).text())

        ///Regenerate the user pages to reflect the deleted user
        setUserPages();
    } catch (e) {
        generateErrorBar(e);
    }
}

//Get a page of users for the delete user portion of the page
///offset: how many items have been on previous pages
async function getRemoveUserPage(offset) {
    try {
        //Get User Page
        ///Clear the current user page
        $("#frm-remove-user-page").empty();

        ///Get the page size from the select box
        var pageSize = $("#frm-remove-user-page-num").val();

        ///Set the offset to the user session object
        userSession.removePageOffset = offset;

        ///The URI for the API to get a user page, complete with query string parameters
        var api = apiRoot + "/class/user-page?school=" + getSchool() + "&classID=" + getClassID() + "&offset=" + offset + "&amount=" + pageSize + "&pageType=remove";

        ///The API call to get the user page
        var data = await callGetAPI(api, "user data");

        userSession.removeUserNum = data.count;

        //Displaying User Page
        ///For each user in the page
        data.userPage.forEach((element, index) => {
            ///Add their data to an object - converting it into a form that the function can handle
            var user = {};
            user.ID = element[0].longValue;
            user.firstName = element[1].stringValue;
            user.lastName = element[2].stringValue;
            user.accessLevel = element[3].stringValue;

            ///Append a delete user row containing their information to the delete user page
            $("#frm-remove-user-page").append(generateRemoveUserRow(user, index));
        });

        ///Generate the page markers to go on the bottom of the delete page
        generateRemovePageMarkers(data.count, offset/pageSize);

        ///If this is the first page
        if(offset <= 0){
            ///Disable the previous page button
            $("#remove-btn-prev").attr("disabled", "disabled");
        } else {
            ///If this is not the first page make sure the previous page button is enabled
            $("#remove-btn-prev").removeAttr("disabled");
        }
    
        ///If this is the last page
        if(offset + pageSize >= data.count){
            ///Disable the next page button
            $("#remove-btn-next").attr("disabled", "disabled");
        } else {
            ///If this is not the last page make sure the next page button is enabled
            $("#remove-btn-next").removeAttr("disabled");
        }

    } catch (e) {
        generateErrorBar(e);
    }
}

//Generate a delete user row for the user page
///user: the data of the user to be displayed on the row
///index: the number of the user on the page
function generateRemoveUserRow(user, index) {
    //Generate User Row
    ///Array to store each line of the row - concatenated and returned at the end of the function
    var userRow = [];

    ///Push the remove user row to the array
    userRow.push(
        '<div class="row user-row">',
            ///Contains a user's first name, last name, email, date of birth and access level
            '<div class="col-xs-4" id="remove-user-first-name-' + index + '">' + user.firstName + '</div>',
            '<div class="col-xs-4" id="remove-user-last-name-' + index + '">' + user.lastName + '</div>',
            '<div class="col-xs-3" id="remove-user-access-level-' + index + '">' + user.accessLevel + '</div>',
            ///Also contains a button that allows the viewer to delete this user
            '<div class="col-xs-1">',
                '<button type="button" class="btn btn-remove" onclick="removeUserFromClass(' + index + ", " + user.ID + ')"><i class="ion-close-round"></i></button>',
            '</div>',
        '</div>'
    );

    return userRow.join("");
}

//Changes the user page by + or - 1
///Change: how many pages to change by
function newRemoveUserPage(change) {
    //Variables
    ///The number of users on a page, determined by a select box
    var pageSize = $("#frm-remove-user-page-num").val();

    ///How many users to change by
    var changeBy = pageSize * change;

    ///How many users are now in previous pages
    var offset = userSession.removePageOffset + changeBy;


    //Change page
    ///If the new offset is a valid number
    if(offset >= 0 || offset <= userSession.removeUserNum){
        ///Change the user page
        getRemoveUserPage(offset);    
    }
}

//Sets the user page to a new page
///pageNumber: the number of the page you are now changing to
function setRemoveUserPage(pageNumber) {
    //Variables
    ///The number of users on a page, determined by a select box
    var pageSize = $("#frm-remove-user-page-num").val();

    ///The number of users now on previous pages
    var offset = pageSize * pageNumber;


    //Change Page
    ///If the new offset is a valid number
    if(offset >= 0 || offset <= userSession.removeUserNum){
        ///Change the user page
        getRemoveUserPage(offset);    
    }
}

//Generates the page markers that go underneath the delete page
///numOfItems: how many users there are for the current school
///currentPage: which page is currently selected
function generateRemovePageMarkers (numOfItems, currentPage) {
    //Generate Page Markers
    ///Empty out the current page marker row
    $("#remove-page-markers").empty();

    ///The number of users on a page, determined by a select box
    var pageSize = $("#frm-remove-user-page-num").val();

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
            $("#remove-page-markers").append('<a class="page-marker-selected">' + i + '</a>');
        } else {     
            ///If it is not the currently selected page append a normal page marker
            $("#remove-page-markers").append('<a class="page-marker" onclick="setAddUserPage(' + i + ')">' + i + '</a>');
        }
    }
}

//Deletes a user
///index: the number of the user in the delete user page
async function removeUserFromClass(index, userID) {
    try {
        clearStatusBar();

        //Delete User
        ///The URI of the api to delete a user, compelete with all of the relevant parameters
        var api = apiRoot + "/class/delete-link?senderUsername=" + userSession.auth.username + "&classID=" + getClassID() + "&userID=" + userID;
        
        ///Calling the API to delete a user
        await callGetAPI(api, "user data");

        ///Show the user that the deletion was successful
        generateSuccessBar("User " + $("#add-user-first-name-" + index).text() + " " + $("#add-user-last-name-" + index).text() + " has been removed from class " + $("#class-name-select option:selected").text())

        ///Regenerate the user page to reflect the deleted user
        setUserPages();
    } catch (e) {
        generateErrorBar(e);
    }
}

function setUserPages() {
    setAddUserPage(userSession.addPageOffset);
    setRemoveUserPage(userSession.removePageOffset);

    $("#class-delete-check").prop("checked", false);
    $("#delete-class-btn").attr("disabled", "disabled");
}

async function getTopic() {
    try {
        clearStatusBar();

        var api = apiRoot + "/class/get-subject?classID=" + getClassID();
        
        var topic = await callGetAPI(api, "class data");
        topic = topic.topic;

        $("#change-name-input").val($("#class-name-select option:selected").text());
        $("#change-subject-input").val(topic);
    } catch (e) {
        generateErrorBar(e);
    }
}

async function editClassData(valueType) {
    try {
        clearStatusBar();

        var newValue = $("#change-" + valueType + "-input").val();

        var api = apiRoot + "/class/edit?senderUsername=" + userSession.auth.username + "&classID=" + getClassID() + "&school=" + getSchool() + "&newValue=" + newValue + "&valueType=" + valueType;

        ///Calling the API to delete a user
        await callGetAPI(api, "class data");

        await getClasses();

        generateSuccessBar("Class " + valueType + " successfully changed to \"" + newValue + "\"")
    } catch (e) {
        generateErrorBar(e);
    }
}


function deleteClassCheck() {
    if($("#class-delete-check").prop('checked')) {
        $("#delete-class-btn").removeAttr("disabled");
    } else {
        $("#delete-class-btn").attr("disabled", "disabled");;
    }
}

async function deleteClass() {
    try {
        clearStatusBar();

        //Delete Class
        ///The URI of the api to delete a class, compelete with all of the relevant parameters
        var api = apiRoot + "/class/delete?school=" + getSchool() + "&senderUsername=" + userSession.auth.username + "&classID=" + getClassID();
        
        ///Calling the API to delete a class
        await callGetAPI(api, "class data", false);

        ///Show the user that the deletion was successful
        generateSuccessBar("Class " + $("#class-name-select option:selected").text() + " has been deleted")

        ///Regenerate the class list to reflect the deleted class
        getClasses();
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