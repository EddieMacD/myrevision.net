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
            window.location.replace(baseURL + loginLocation);
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

        school = school.school;

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

//Get the new user's school from the school select box (hidden for teachers since they can only add to their own school)
function getSchool() {
    return $("#school-select").val();
}

//Gets a list of classes for a particular school
async function getClasses() {
    try {
        //Get Classes
        ///The URI for the API to recall a list of classes, passing in the user's school as a parameter
        var api = apiRoot + "/class/recall?school=" + getSchool();

        ///The API is called and the list of classes is returned and extracted
        var classData = await callGetAPI(api, "classes");
        classData = classData.userClasses;

        ///If there are classes in the list
        if(classData != false) {
            ///Empty out the class select box
            $("#class-name-select").empty();

            ///For each class in the list
            classData.forEach((element) => {
                ///Add a select item containing that class information
                $("#class-name-select").append(newSelectItemValue(element[1].stringValue, element[0].longValue))
            })

            ///Reset the assignment page
            userSession.assignmentPageOffset = 0;
            getAssignmentPage(0);

            ///Load the filters
            loadQualification();
        } else {
            ///Hide the rest of the page
            $("#edit-assignment-container").hide();
            $("#add-assignment-container").hide();
            
            ///Tell the user why they can't create an assignment
            generateUpdateBar("This school has no classes. Please create a class to create assignments for");
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

//Loads the qualifications from S3. Runs on class change
async function loadQualification() {
    //Error checking
    ///Basic set up for all API calls. In the case of an error it generates an error bar with an appropriate message
    ///For APi calls the message is generated by the promise result
    ///In the case of page changes they are reversed in the catch statement
    try {
        ///Clears the error bar, at the beginning of all try statements - empties out any error messages since a user has made a change. Standard error checking procedure 
        clearStatusBar();

        //Variables
        ///Array containing the data pulled from the file system
        var qualifications = [];

        ///The api to be called to get the qualifications
        var api = apiRoot + "/question/filter-recall";


        //Updating the page
        ///Awaits the qualifications from the API call
        qualifications = await callGetAPI(api, "qualifications");

        ///Clears the qualification input box of any values - removes pre-set data 
        $("#qualification").empty();

        ///Adds the new data from S3 to the qualifications box
        qualifications.filters.qualifications.forEach(element => {
            $("#qualification").append(newSelectItem(element.q));
        });

        ///Runs the on change event for the qualifications box
        newQualification();
    } catch (error) {
        generateErrorBar(error);
    }
}

//Compiles an API URI for the filter function. Uses REST for a GET method
///filePath: The location of the index file to be pulled form S3
///isTopics: If the file to be pilled is for the topics, changing the file name to be selected in the function
function filterAPI(filePath, isTopics) {
    //API construction
    ///Variable to store the URI, to be passed out at the end of the function
    var uri = "";

    ///Adds the API root, the correct resource and the filepath parameter to the URI
    uri = apiRoot + "/question/filter-recall?filePath=" + filePath;

    ///If the api is to call topics then it adds the boolean variable onto the URI
    if(isTopics) {
        uri += "&topics=true";
    }

    return uri;
}

//Compiles a string containing a select item with corresponding text and value
///text: The label and the value of the option
function newSelectItem(text) {
    //String compilation
    ///Correctly formats HTML to be appended to the input box, returned at the end of the function
    var option = "<option value='" + text + "'>" + text + "</option>";

    return option
}

//Loads new exam boards from S3 based on the selected qualification. Runs on qualification change
async function newQualification() {
    try {
        clearStatusBar();

        //Variables
        ///Array containing the data pulled from the file system
        var examBoards = [];

        ///The file path of the qualification, therefore the location of the index file containing the exam boards
        userSession.filePath = encodeURIComponent($("#qualification").val()) + "/";

        ///Variable containing the api to be called for the exam boards
        var api = filterAPI(userSession.filePath, false);


        //Updating the page
        ///Awaits the API call and therefore the exam boards
        examBoards = await callGetAPI(api, "exam boards");

        ///Empties the exam board input
        $("#examBoard").empty();

        ///Puts the retrieved exam boards into the input box
        examBoards.filters.examBoards.forEach(element => {
            $("#examBoard").append(newSelectItem(element.e));
        });
            
        ///Runs the onChange for the exam board box
        newExamBoard();
    } catch (error) {
        generateErrorBar(error);
    }
}

//Loads new subjects from S3 based on the selected exam board. Runs on exam board change
async function newExamBoard() {
    try { 
        clearStatusBar();

        //Variables
        ///Array containing the data pulled from the file system
        var subjects = [];

        ///The file path of the qualification, therefore the location of the index file containing the subjects
        userSession.filePath = encodeURIComponent($("#qualification").val()) + "/" + encodeURIComponent($("#examBoard").val()) + "/";

        ///Variable containing the api to be called for the subjects
        var api = filterAPI(userSession.filePath, false);


        //Updating the page
        ///Awaits the API call and therefore the subjects
        subjects = await callGetAPI(api, "subjects");

        ///Empties the subject input
        $("#subject").empty();

        ///Puts the retrieved subjects into the input box
        subjects.filters.subjects.forEach(element => {
            $("#subject").append(newSelectItem(element.s));
        });

        ///Runs the onChange for the topic box
        newSubject();
    } catch (error) {
        generateErrorBar(error);
    }
}

//Loads new topics from S3 based on the selected subject
async function newSubject() {
    try {
        clearStatusBar();

        //Variables
        ///Array containing the topics pulled from the file system
        var topics = [];

        ///The file path of the topics file
        userSession.filePath = encodeURIComponent($("#qualification").val()) + "/" + encodeURIComponent($("#examBoard").val()) + "/" + encodeURIComponent($("#subject").val()) + "/";

        ///The api to be called to get the topics file for the correct subject
        var api = filterAPI(userSession.filePath, true);


        //Get topics
        ///Awaits the topic file from S3
        topics = await callGetAPI(api, "topics");

        ///Puts the topics into the user session variable
        userSession.topics = topics.filters;

        ///Log the topics, for testing
        //console.log(userSession.topics);

        ///Loads the topics display
        loadTopicDisplay();
    } catch (error) {
        generateErrorBar(error);
    }
}

function loadTopicDisplay() {
    //Variables
    ///Array containing all of the HTML for the topic display
    var topicSelector = [];


    //Display changes 
    ///For each topic section
    userSession.topics.sections.forEach(section => {
        ///Open a topic section div and add a check box for the section
        topicSelector.push(
            "<div class='topic-section'>",
            newThemeBox(section.s, "sections", false)
        );

        ///For each topic in the section 
        userSession.topics[section.s].forEach((topic, i) => {
            ///Add a checkbox for each topic with isChild being true
            topicSelector.push(newThemeBox(topic.t, section.s, true));
        });

        ///Close the section dic
        topicSelector.push("</div>");
    });

    ///Empties the topic selector of any previous or fail data
    $("#topic-select").empty();

    ///Appends the topic selector with all of the HTMl stored in the topic array
    $("#topic-select").append(topicSelector.join(""));

    ///Runs the onClick event for the select all button - makes sure all buttons are not selected and resets the status text
    selectAll("sections");
}

//Generates a checkbox for a theme
///name: the display text and the value of the box
///section: the section that the box belongs to
///isChild: a boolean variable to store whether the box should be indented, as it is a topic not a section
function newThemeBox(name, section, isChild) {
    //Variables
    ///Stores the string for the check box - returned at the end of the function
    var checkBox = "";

    ///A temporary variable containing the class to be given to the box - made from the section and converted into a CSS friendly form
    var boxClass = textToCSS(section);
    
    ///A temporary variable containing the ID for the box - made from the name and converted into CSS friendly syntax
    var boxID = textToCSS(name);


    //Box compilation
    ///Adds the input tye and the class to the string
    checkBox = '<input type="checkbox" class="' + boxClass;

    ///If the box is a child it adds the child box class
    if(isChild){
        checkBox += ' child-box';
    }

    ///Adds the rest of the correctly formatted box
    checkBox += ' check-box" onchange="massSelect(\'' + boxID + '\',\'' + boxClass + '\')" value="' + name + '" id="' + boxID + '"/>';

    ///Adds the label to the box
    checkBox += '<label class="check-box-label" for="' + boxID + '">' + name + '</label><br/>'

    return checkBox;
}

///Converts inputted text into a CSS friendly form
function textToCSS(text){
    //Variables
    ///A temporary variable to store the output - returned at the end of the function
    var output = text;


    //Replacing
    ///Uses regex to remove all invalid characters, excluding spaces
    output = output.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"");

    ///Replaces any spaces with dashed
    output = output.replaceAll(" ", "-");

    ///Converts the string to lower case
    output = output.toLowerCase();

    return output;
}

//Selects or deselect every box in the topics section
///boxID: the id of the select all box
function selectAll(boxID){
    try {
        clearStatusBar();

        //Variables
        ///Stores whether the boxes are to be checked or unchecked
        var isSelected = $("#" + boxID).prop("checked");


        //Selection
        ///Changes the checked property of every check box in the topic-select class to the value in isSelected
        $(".assignment-topic-select input[type='checkbox']").prop('checked', isSelected);


        //Counting
        ///Resets the number of topics to 0
        userSession.numTopics = 0;

        ///If the boxes were checked
        if(isSelected){
            ///For each section
            userSession.topics.sections.forEach(section => {
                ///Add the number of topics in that section to the number of topics total
                userSession.numTopics += userSession.topics[section.s].length;
            });
        }

        ///Update the display for the number of checked boxes
        updateNumChecked();
    } catch (error) {
        $("#" + boxID).prop("checked", !$("#" + boxID).prop("checked"));

        generateErrorBar(error);
    }
}

//The onClick for a topic check box - handles counting and mass selectors
function massSelect(boxID, boxClass) {
    try {
        clearStatusBar();

        //Variables
        ///The checked property of the box that was selected to run the function - boolean
        var isSelected = $("#" + boxID).prop("checked");
        ///A boolean variable to aid in counting single boxes
        var isChild = true;

        //Counting
        ///For each section
        userSession.topics.sections.forEach(section => {
            ///Use a temporary variable to store the section name in CSS form
            var tempSection = textToCSS(section.s);

            ///If the current box is a mass selector
            if(tempSection === boxID) {
                ///The box is not a child
                isChild = false;

                ///If the box is to be selected
                if(isSelected) {
                    ///For each box with the class of the section selector
                    $("." + boxID).each((index, element) => {
                        ///If they're not checked
                        if(!$(element).prop('checked')){
                            ///Add one to the count
                            userSession.numTopics++;
                        }
                    });
                } else {
                    ///If the box is being deselected then remove the number of boxes in that section from the count
                    userSession.numTopics -= userSession.topics[section.s].length;
                }
            }
        });

        ///If the box is a child
        if(isChild)
        {
            ///if the box is to be selected
            if(isSelected) {
                ///Add one to the count
                userSession.numTopics++;
            } else {
                ///If the box is to be deselected then remove one from the count
                userSession.numTopics--;
            }
        }

        //Display updates
        ///Changes the checked property of every check box with the same class as the box's ID to the value in isSelected
        $("." + boxID).prop('checked', isSelected);

        ///Updates the mass selectors / checks if all child boxes are checked
        updateMassSelectors(isSelected, boxClass);

        ///Update the display for the number of checked boxes
        updateNumChecked();
    } catch (error) {
        $("#" + boxID).prop("checked", !$("#" + boxID).prop("checked"));

        generateErrorBar(error);
    }
}

//Updates the topic header with the number of topics selected
function updateNumChecked() {
    //Display updates
    ///If the number of topics is 0
    if(userSession.numTopics === 0) {
        ///Change the text to ask the user to select a topic
        $("#num-topics-selected").text("Please select one or more topic");
        ///Disable the do questions button
        $(".btn-questions").attr("disabled", "disabled");
    } else {
        ///If there is one or more topic selected show the user how many topics are selected
        $("#num-topics-selected").text(userSession.numTopics + " selected");
        ///Enable the do questions button
        $(".btn-questions").removeAttr("disabled");
    }
}

//Updates the section boxes and the select all box
///isSelected: stores whether the box that was changed was selected or deselected
///boxClass: the class of the box that was checked
function updateMassSelectors(isSelected, boxClass){
    //Variables
    ///Boolean storing whether all of the boxes have been selected
    var isAllSelected = true;

    //Checking and updating
    ///If the box was selected
    if(isSelected) {
        ///For each box with that class
        $("." + boxClass).each(function(index, element) {
            ///If they were not selected
            if(!$(element).prop('checked')){
                ///Then all selected is set to false
                isAllSelected = false;
            }
        });

        ///Updates the relevant mass selector with the value of all selected
        $("#" + boxClass).prop('checked', isAllSelected);

        ///If the box is not a sections box
        if(boxClass != "sections")
        {
            ///Run this function again for the select all button
            updateMassSelectors(true, "sections");
        }
    } else {
        ///If the box was deselected then deselect the section selector and the select all button
        $("#" + boxClass).prop('checked', false);
        $("#sections").prop('checked', false);
    }
}

//Get the ID of the class from the class selector box
function getClassID() {
    return $("#class-name-select").val();
}

//Get the name of the class from the class selector box
function getClassName() {
    return $("#class-name-select option:selected").text();
}

//Creates an assignment
async function createAssignment() {
    try {
        clearStatusBar();

        //Variables
        ///The api to be called in order to create an assignment
        var api = apiRoot + "/assignment/create";

        ///The post body for creating an assignment, with all of the required information
        var postBody = {};
        postBody.senderUsername = userSession.auth.username;
        postBody.classID = getClassID();
        postBody.assignmentData = getAssignmentData();

        ///Calling the API to create an assignment
        await callPostAPI(api, postBody, "an assignment", false);

        ///Refresh the page for editing assignments
        await getAssignmentPage(0);

        ///Show the user that success has been had
        generateSuccessBar("Assignment " + postBody.assignmentData.name + " created for class  " + getClassName());
    } catch (e) {
        generateErrorBar(e);
    }
}

//Collates data for creating an assignment
function getAssignmentData() {
    //Assignment Data
    ///Object to store the assignment data
    var assignmentData = {};

    ///The name of the assignment
    assignmentData.name = $("#new-assignment-name").val();

    ///The description of the assignment - not called description in variables as it might be a key word
    assignmentData.info = $("#new-assignment-description").val();

    ///The deadline of the assignment
    assignmentData.deadline = getDeadline();

    ///The topics that the questions may come from - stored in the post body
    assignmentData.filters = JSON.stringify(getFilters());

    return assignmentData;
}

//Gets the current deadline in a format that the backend finds friendly
function getDeadline() {
    //Deadline
    ///The deadline as a time
    var deadline = new Date($("#new-assignment-deadline").val())

    ///Converting the deadline ISO string - e.g. '2021-11-03T15:33:31.424Z'
    deadline = deadline.toISOString();

    ///Cutting off the Z
    return deadline.substring(0, 23);
}

//Compiles filters and returns an object
function getFilters() {
    //Filter Compilation
    ///Object to store the filters
    var filters = {};

    ///The number of questions to be generated
    filters.numOfQuestions = $("#numberOfQuestions").val();

    ///The location of the questions inside the object store
    filters.filePath = $("#qualification").val() + "/" + $("#examBoard").val() + "/" + $("#subject").val() + "/";

    ///The topics that the questions may come from - stored in the post body
    filters.topics = compileTopics();

    return filters;
}


//Loops through the theme check boxes and return the values that are checked 
function compileTopics() {
    //Theme compilation
    ///Array to store the themes, returned at the end of the program
    var themes = [];

    ///For each child box
    $(".child-box").each(function(index, element) {
        ///If the box is checked
        if($(element).prop('checked')){
            ///Push the ID of the box to the array of themes
            themes.push($(element).attr("id"));
        }
    });

    return themes;
}

//Get a page of assignments for the edit assignment portion of the page
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

        ///The URI for the API to get a assignment page, complete with query string parameters
        var api = apiRoot + "/assignment/read/page?classID=" + getClassID() + "&offset=" + offset + "&amount=" + pageSize;

        ///The API call to get the assignment page
        var data = await callGetAPI(api, "assignment data");

        if(data.count > 0) {
            $("#edit-assignment-container").show();

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

                ///Append an edit assignment row containing their information to the edit assignment page
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

            $("#assignment-0").prop('checked', true);
            selectAssignment(0);
        } else {
            $("#edit-assignment-container").hide();

            generateUpdateBar("This class has no outstanding assignments")
        }
    } catch (e) {
        generateErrorBar(e);
    }
}

//Generate an edit assignment row for the assignment page
///assignment: the data of the assignment to be displayed on the row
///index: the number of the assignment on the page
function generateAssignmentRow(assignment, index) {
    //Generate Assignment Row
    ///Array to store each line of the row - concatenated and returned at the end of the function
    var assignmentRow = [];

    ///Push the assignment row to the array
    assignmentRow.push(
        '<div class="row assignment-row">',
            ///Contains an assignment's ID, name, description, amd deadline
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
    var pageSize = $("#frm-assignment-page-num").val();

    ///How many assignments to change by
    var changeBy = pageSize * change;

    ///How many assignments are now in previous pages
    var offset = userSession.assignmentPageOffset + changeBy;


    //Change page
    ///If the new offset is a valid number
    if(offset >= 0 || offset <= userSession.assignmentNum){
        ///Change the assignment page
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

//Selects an assignment
///index: the index of the assignment that was selected
async function selectAssignment(index) {
    try {
        clearStatusBar();

        //Get Details
        ///The index of the assignment is assigned to userSession
        userSession.selectedAssignment = index;

        ///The URI for the API to read the details of an assignment
        var api = apiRoot + "/assignment/read/details?assignmentID=" + getSelectedID() + "&senderUsername=" + userSession.auth.username;

        ///Getting the details about the assignment from the back end
        var data = await callGetAPI(api, "assignment data");

        ///The details of the assignment are compiled into an object
        var assignmentData = {};
        assignmentData.name = data[0].stringValue;
        assignmentData.info = data[1].stringValue;
        assignmentData.deadline = data[2].stringValue;
        assignmentData.filters = JSON.parse(JSON.parse(data[3].stringValue));

        ///The compiled data is passed to this function to show it to the user
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
    var temp = new Date (assignmentData.deadline)
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

//Edits the metadata of an assignment
async function editAssignment() {
    try {
        clearStatusBar();

        //Variables
        ///The api to be called in order to edit an assignment
        var api = apiRoot + "/assignment/edit";

        ///The post body for editing an assignment, with all of the required information
        var postBody = {};
        postBody.senderUsername = userSession.auth.username;
        postBody.classID = getClassID();
        postBody.assignmentData = getEditAssignmentData();

        //console.log(JSON.stringify(JSON.stringify(postBody)));

        ///Calling the API to edit an assignment
        await callPostAPI(api, postBody, "an assignment", false);

        ///Refresh the assignment page for edititng assignments
        getAssignmentPage(0);

        ///Show the user that success has been had
        generateSuccessBar("Assignment " + postBody.assignmentData.name + " edited");
    } catch (e) {
        generateErrorBar(e);
    }
}

//Compiles the data required to edit an assignment
function getEditAssignmentData() {
    //Assignment Data
    ///Object to store the assignment data
    var assignmentData = {};

    assignmentData.ID = getSelectedID();

    ///The name of the assignment
    assignmentData.name = $("#edit-assignment-name").val();

    ///The description of the assignment - not called description in variables as it might be a key word
    assignmentData.info = $("#edit-assignment-description").val();

    ///The deadline of the assignment
    assignmentData.deadline = getEditDeadline();

    return assignmentData;
}

//Gets the deadline in a format that the backend finds friendly
function getEditDeadline() {
    //Deadline
    ///The deadline as a time
    var deadline = new Date($("#edit-assignment-deadline").val())

    ///Converting the deadline ISO string - e.g. '2021-11-03T15:33:31.424Z'
    deadline = deadline.toISOString();

    ///Cutting off the Z
    return deadline.substring(0, 23);
}

//Enables or disables the delete button for assignments
function deleteAssignmentCheck() {
    //Button Handler
    ///If the checkbix is checked, enable the button
    if($("#assignment-delete-check").prop('checked')) {
        $("#delete-assignment-btn").removeAttr("disabled");
    } else {
        ///If not then disable the button
        $("#delete-assignment-btn").attr("disabled", "disabled");;
    }
}

//Deletes an assignment
async function deleteAssignment() {
    try {
        clearStatusBar();

        //Delete Assignment
        ///The URI of the api to delete an assignment, compelete with all of the relevant parameters
        var api = apiRoot + "/assignment/delete?senderUsername=" + userSession.auth.username + "&assignmentID=" + getSelectedID();
        
        ///Calling the API to delete an assignment
        await callGetAPI(api, "class data", false);

        ///Regenerate the class list to reflect the deleted class
        getAssignmentPage(0);

        ///Show the user that the deletion was successful
        generateSuccessBar("Assignment " + getSelectedName() + " has been deleted")
    } catch (e) {
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
    userSession.loaderVal = 1;
 
    //Function calls
    await initialiseAuth(); 

    //Gets the current user's school
    getUserSchool();
}