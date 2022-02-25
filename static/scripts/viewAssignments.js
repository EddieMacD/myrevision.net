//Get a page of assignments for the view assignment portion of the page
///offset: how many items have been on previous pages
async function getAssignmentPage(offset) {
    try {
        //Get Assignment Page
        ///Clear the current assignment page
        $("#frm-assignment-page").empty();

        ///Get the page size from the select box
        var pageSize = $("#frm-assignment-page-num").val();

        ///Set the offset to the user session object
        userSession.assignmentPageOffset = offset;

        ///The URI for the API to get an outstanding assignment page, complete with query string parameters
        var api = apiRoot + "/assignment/read/list?email=" + userSession.auth.email + "&offset=" + offset + "&amount=" + pageSize;

        ///The API call to get the assignment page
        var data = await callGetAPI(api, "assignment data");

        ///If there are assignments outstanding
        if(data.count > 0) {
            ///Show the select assignment list
            $("#view-assignment-container").show();

            ///Unpackage the data from the back-end, storing the count in the user session and moving the assignments to the front of the temporary variable
            userSession.assignmentNum = data.count;
            data = data.assignments;

            //Displaying Assignment Page
            ///For each assignment in the page
            data.forEach((element, index) => {
                ///Add their data to an object - converting it into a form that the function can handle
                var assignment = {};
                assignment.ID = element[0].longValue;
                assignment.name = element[1].stringValue;
                assignment.info = element[2].stringValue;
                assignment.deadline = element[3].stringValue;

                ///Append a view assignment row containing their information to the view assignment page
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

            ///Show the assignments, select the first one and show that assignment's details
            showList();
            $("#assignment-0").prop('checked', true);
            selectAssignment(0);
        } else {
            ///If there are no assignments outstanding then hide the assignment selector and inform the user
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
            ///Contains an assignment's ID, name, description, and deadline
            '<div class="col-xs-1" id="assignment-id-' + index + '">' + assignment.ID + '</div>',
            '<div class="col-xs-2" id="assignment-name-' + index + '">' + assignment.name + '</div>',
            '<div class="col-xs-6" id="assignment-info-' + index + '">' + assignment.info + '</div>',
            '<div class="col-xs-2" id="assignment-deadline-' + index + '">' + assignment.deadline + '</div>',
            ///Also contains a button that allows the viewer to select this assignment
            '<div class="col-xs-1">',
                '<input type="radio" id="assignment-' + index + '" name="assignment-select" value="assignment-' + assignment.ID + '" onclick="selectAssignment(' + index + ')">',
            '</div>',
        '</div>'
    );

    return assignmentRow.join("");
}

//Changes the assignment page by + or - 1
///Change: how many pages to change by
function newAssignmentPage(change) {
    //Variables
    ///The number of assignments on a page, determined by a select box
    var pageSize = $("#frm-add-user-page-num").val();

    ///How many users to change by
    var changeBy = pageSize * change;

    ///How many assignments are now in previous pages
    var offset = userSession.assignmentPageOffset + changeBy;


    //Change page
    ///If the new offset is a valid number
    if(offset >= 0 || offset <= userSession.assignmentNum){
        ///Change the assignments page
        getAssignmentPage(offset);    
    }
}

//Sets the assignment page to a new page
///pageNumber: the number of the page you are now changing to
function setAssignmentPage(pageNumber) {
    //Variables
    ///The number of assignments on a page, determined by a select box
    var pageSize = $("#frm-assignment-page-num").val();

    ///The number of assignments now on previous pages
    var offset = pageSize * pageNumber;


    //Change Page
    ///If the new offset is a valid number
    if(offset >= 0 || offset <= userSession.assignmentUserNum){
        ///Change the assignment page
        getAssignmentPage(offset);    
    }
}

//Generates the page markers that go underneath the delete page
///currentPage: which page is currently selected
function generateAssignmentPageMarkers (currentPage) {
    //Generate Page Markers
    ///Empty out the current page marker row
    $("#assignment-page-markers").empty();

    ///The number of assignments on a page, determined by a select box
    var pageSize = $("#frm-assignment-page-num").val();

    ///How many markers to generate - truncated by parse int so one is added if there are extraneous assignments
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

//Select an assignment to show it's details
///index: the index of the assignment on the list
async function selectAssignment(index) {
    try {
        clearStatusBar();

        //Select Assignment
        ///Set index and the assignment ID to the user session object 
        userSession.selectedAssignment = index;
        userSession.assignmentID = getSelectedID();


        ///The URI for the API to read the assignment's details, with the releveant parameters
        var api = apiRoot + "/assignment/read/details?assignmentID=" + userSession.assignmentID + "&senderUsername=" + userSession.auth.username;

        ///Calling the API to get assignment details
        var data = await callGetAPI(api, "assignment data");

        ///Unpacking the assignment data from the back-end
        var assignmentData = {};
        assignmentData.name = data[0].stringValue;
        assignmentData.info = data[1].stringValue;
        assignmentData.deadline = data[2].stringValue;
        assignmentData.filters = JSON.parse(JSON.parse(data[3].stringValue));

        ///Show the assignment
        showSelectedAssignment(assignmentData);
    } catch (e) {
        generateErrorBar(e);
    }
}

//Shows an assignment to the user
///assignmentData: the details of the assignment
function showSelectedAssignment(assignmentData) {
    //Show Assignmnent Data
    ///The name and description are shown in their respective slots
    $("#edit-assignment-name").val(assignmentData.name);
    $("#edit-assignment-description").val(assignmentData.info);

    ///The date is converted into a format that is accepted by the date input
    var temp = new Date(assignmentData.deadline)
    temp = temp.toISOString();
    temp = temp.substring(0, 22)
    $("#edit-assignment-deadline").val(temp);

    //Show Filters
    ///The file path is extracted from the object
    var filePath = assignmentData.filters.filePath;

    ///The qualification is extracted from the string and shown before it is removed
    $("#selected-qualification").val(filePath.substring(0, filePath.indexOf("/")));
    filePath = filePath.substring(filePath.indexOf("/") + 1);

    ///The exam board is extracted from the string and shown before it is removed
    $("#selected-examBoard").val(filePath.substring(0, filePath.indexOf("/")));
    filePath = filePath.substring(filePath.indexOf("/") + 1);

    ///The subject is shown as the last part of the string
    $("#selected-subject").val(filePath.substring(0, filePath.indexOf("/")));

    ///The number of questions is also shown to the user
    $("#selected-numberOfQuestions").val(assignmentData.filters.numOfQuestions)
}

//Gets the ID of the selected assignment
function getSelectedID() {
    return $("#assignment-id-" + userSession.selectedAssignment).text();
}

//Gets the name of the selected assignment
function getSelectedName() {
    return $("#assignment-name-" + userSession.selectedAssignment).text();
}

//Starts the selected assignment
function startAssignment() {
    //Start Assignment
    ///Sets the assignment ID to the session storage and loads the questions page
    sessionStorage.setItem("assignmentID", userSession.assignmentID);
    window.location.replace(baseURL + "questions");
}

//Shows an assignment that was linked to from another source
///assignmentID: the ID of the assignment that was linked to
async function getLinkedAssignment (assignmentID) {
    try {
        clearStatusBar();

        //Get Assignment
        ///The URI of the API to call to get the assignment details
        var api = apiRoot + "/assignment/read/details?assignmentID=" + assignmentID + "&senderUsername=" + userSession.auth.username;

        ///Calling the API to get assignment details
        var data = await callGetAPI(api, "assignment data");

        ///Unpacking the assignment data
        var assignmentData = {};
        assignmentData.name = data[0].stringValue;
        assignmentData.info = data[1].stringValue;
        assignmentData.deadline = data[2].stringValue;
        assignmentData.filters = JSON.parse(JSON.parse(data[3].stringValue));

        ///Setting the assignment ID to session storage
        userSession.assignmentID = assignmentID;

        ///Showing the selected assignment and hiding the selector list
        showSelectedAssignment(assignmentData);
        hideList();
    } catch (e) {
        generateErrorBar(e);
    }
}

//Hides the select assignment list
function hideList() {
    $("#select-assignment-box").hide();
}

//Shows the select assignment list
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

    ///If the session storage contains an assignment ID
    if(sessionStorage.getItem("assignmentID")) {
        ///Get the linked assignment from the ID and remove the ID from session storage
        getLinkedAssignment(sessionStorage.getItem("assignmentID"));
        sessionStorage.removeItem("assignmentID")
    } else {
        ///If not then get an assignment page
        getAssignmentPage(0);
    }
}