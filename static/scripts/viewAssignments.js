//Get a page of users for the delete user portion of the page
///offset: how many items have been on previous pages
async function getAssignmentPage(offset) {
    try {
        //Get User Page
        ///Clear the current user page
        $("#frm-assignment-page").empty();

        ///Get the page size from the select box
        var pageSize = $("#frm-assignment-page-num").val();

        ///Set the offset to the user session object
        userSession.assignmentPageOffset = offset;

        ///The URI for the API to get a user page, complete with query string parameters
        var api = apiRoot + "/assignment/read/list?email=" + userSession.auth.email + "&offset=" + offset + "&amount=" + pageSize;

        ///The API call to get the user page
        var data = await callGetAPI(api, "assignment data");

        if(data.count > 0) {
            $("#view-assignment-container").show();

            userSession.assignmentNum = data.count;

            data = data.assignments;

            //Displaying User Page
            ///For each user in the page
            data.forEach((element, index) => {
                ///Add their data to an object - converting it into a form that the function can handle
                var assignment = {};
                assignment.ID = element[0].longValue;
                assignment.name = element[1].stringValue;
                assignment.info = element[2].stringValue;
                assignment.deadline = element[3].stringValue;

                ///Append a delete user row containing their information to the delete user page
                $("#frm-assignment-page").append(generateAssignmentRow(assignment, index));
            });

            ///Generate the page markers to go on the bottom of the delete page
            generateAssignmentPageMarkers(offset/pageSize);

            ///If this is the first page
            if(offset <= 0){
                ///Disable the previous page button
                $("#assignment-btn-prev").attr("disabled", "disabled");
            } else {
                ///If this is not the first page make sure the previous page button is enabled
                $("#assignment-btn-prev").removeAttr("disabled");
            }
        
            ///If this is the last page
            if(offset + pageSize >= userSession.assignmentNum){
                ///Disable the next page button
                $("#assignment-btn-next").attr("disabled", "disabled");
            } else {
                ///If this is not the last page make sure the next page button is enabled
                $("#assignment-btn-next").removeAttr("disabled");
            }

            showList();
            $("#assignment-0").prop('checked', true);
            selectAssignment(0);
        } else {
            $("#view-assignment-container").hide();

            generateUpdateBar("You don't have any assignments to complete");
        }
    } catch (e) {
        generateErrorBar(e);
    }
}

//Generate a delete user row for the user page
///user: the data of the user to be displayed on the row
///index: the number of the user on the page
function generateAssignmentRow(assignment, index) {
    //Generate User Row
    ///Array to store each line of the row - concatenated and returned at the end of the function
    var assignmentRow = [];

    ///Push the delete row to the array
    assignmentRow.push(
        '<div class="row assignment-row">',
            ///Contains a user's first name, last name, email, date of birth and access level
            '<div class="col-xs-1" id="assignment-id-' + index + '">' + assignment.ID + '</div>',
            '<div class="col-xs-2" id="assignment-name-' + index + '">' + assignment.name + '</div>',
            '<div class="col-xs-6" id="assignment-info-' + index + '">' + assignment.info + '</div>',
            '<div class="col-xs-2" id="assignment-deadline-' + index + '">' + assignment.deadline + '</div>',
            ///Also contains a button that allows the viewer to delete this user
            '<div class="col-xs-1">',
                '<input type="radio" id="assignment-' + index + '" name="assignment-select" value="assignment-' + assignment.ID + '" onclick="selectAssignment(' + index + ')">',
            '</div>',
        '</div>'
    );

    return assignmentRow.join("");
}

//Changes the user page by + or - 1
///Change: how many pages to change by
function newAssignmentPage(change) {
    //Variables
    ///The number of users on a page, determined by a select box
    var pageSize = $("#frm-add-user-page-num").val();

    ///How many users to change by
    var changeBy = pageSize * change;

    ///How many users are now in previous pages
    var offset = userSession.assignmentPageOffset + changeBy;


    //Change page
    ///If the new offset is a valid number
    if(offset >= 0 || offset <= userSession.assignmentNum){
        ///Change the user page
        getAssignmentPage(offset);    
    }
}

//Sets the user page to a new page
///pageNumber: the number of the page you are now changing to
function setAssignmentPage(pageNumber) {
    //Variables
    ///The number of users on a page, determined by a select box
    var pageSize = $("#frm-add-user-page-num").val();

    ///The number of users now on previous pages
    var offset = pageSize * pageNumber;


    //Change Page
    ///If the new offset is a valid number
    if(offset >= 0 || offset <= userSession.assignmentUserNum){
        ///Change the user page
        getAssignmentPage(offset);    
    }
}

//Generates the page markers that go underneath the delete page
///currentPage: which page is currently selected
function generateAssignmentPageMarkers (currentPage) {
    //Generate Page Markers
    ///Empty out the current page marker row
    $("#assignment-page-markers").empty();

    ///The number of users on a page, determined by a select box
    var pageSize = $("#frm-assignment-page-num").val();

    ///How many markers to generate - truncated by parse int so one is added if there are extraneous users
    var numOfMarkers = parseInt(userSession.assignmentNum / pageSize);

    if(userSession.assignmentNum % pageSize != 0) {
        numOfMarkers++;
    }

    ///For the number of markers that need to be generated
    for(var i = 0; i < numOfMarkers; i++)
    {
        ///If it is the currently selected page
        if(i === currentPage) {
            ///Append a selected page marker
            $("#assignment-page-markers").append('<a class="page-marker-selected">' + i + '</a>');
        } else {     
            ///If it is not the currently selected page append a normal page marker
            $("#assignment-page-markers").append('<a class="page-marker" onclick="setAssignmentPage(' + i + ')">' + i + '</a>');
        }
    }
}

async function selectAssignment(index) {
    try {
        clearStatusBar();
        userSession.selectedAssignment = index;

        var api = apiRoot + "/assignment/read/details?assignmentID=" + getSelectedID() + "&senderUsername=" + userSession.auth.username;

        var data = await callGetAPI(api, "assignment data");

        var assignmentData = {};
        assignmentData.name = data[0].stringValue;
        assignmentData.info = data[1].stringValue;
        assignmentData.deadline = data[2].stringValue;
        assignmentData.filters = JSON.parse(JSON.parse(data[3].stringValue));

        userSession.assignmentID = getSelectedID();


        showSelectedAssignment(assignmentData);
    } catch (e) {
        generateErrorBar(e);
    }
}

function showSelectedAssignment(assignmentData) {
    $("#view-assignment-name").val(assignmentData.name);
    $("#view-assignment-description").val(assignmentData.info);

    var temp = new Date (assignmentData.deadline)
    temp = temp.toISOString();
    temp = temp.substring(0, 22)
    $("#view-assignment-deadline").val(temp);

    var filePath = assignmentData.filters.filePath;

    $("#selected-qualification").val(filePath.substring(0, filePath.indexOf("/")));
    filePath = filePath.substring(filePath.indexOf("/") + 1);

    $("#selected-examBoard").val(filePath.substring(0, filePath.indexOf("/")));
    filePath = filePath.substring(filePath.indexOf("/") + 1);

    $("#selected-subject").val(filePath.substring(0, filePath.indexOf("/")));

    $("#selected-numberOfQuestions").val(assignmentData.filters.numOfQuestions);
}

function getSelectedID() {
    return $("#assignment-id-" + userSession.selectedAssignment).text();
}

function getSelectedName() {
    return $("#assignment-name-" + userSession.selectedAssignment).text();
}

function startAssignment() {
    sessionStorage.setItem("assignmentID", userSession.assignmentID);
    window.location.replace(baseURL + "questions");
}

async function getLinkedAssignment (assignmentID) {
    try {
        clearStatusBar();

        var api = apiRoot + "/assignment/read/details?assignmentID=" + assignmentID + "&senderUsername=" + userSession.auth.username;

        var data = await callGetAPI(api, "assignment data");

        var assignmentData = {};
        assignmentData.name = data[0].stringValue;
        assignmentData.info = data[1].stringValue;
        assignmentData.deadline = data[2].stringValue;
        assignmentData.filters = JSON.parse(JSON.parse(data[3].stringValue));

        userSession.assignmentID = assignmentID;

        showSelectedAssignment(assignmentData);
        hideList();
    } catch (e) {
        generateErrorBar(e);
    }
}

function hideList() {
    $("#select-assignment-box").hide();
}

function showList() {
    $("#select-assignment-box").show();
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

    if(sessionStorage.getItem("assignmentID")) {
        getLinkedAssignment(sessionStorage.getItem("assignmentID"));
        sessionStorage.removeItem("assignmentID")
    } else {
        //Gets assignments
        getAssignmentPage(0);
    }
}