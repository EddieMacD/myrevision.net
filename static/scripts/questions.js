//Global variables
///Stores the root of the api for retrieveing questions and answers
const apiRoot = "https://api.myrevision.net";

///Stores user data throughout the running of the website
var userSession = {};

//Generates a bar at the top of the screen to 
function generateErrorBar(text) {
    var errorBar = [];

    errorBar.push(
        "<div class='row error-row'>",
            "<div class='col-xs-12 error-col'>",
                "<label class='error-label'>" + text + "</label>",
            "</div>",
        "</div>",
    );

    $("#error-container").append(errorBar.join(""));
}

userSession.clearErrorBar = () => {
    $("#error-container").empty();
}

//Loads the qualifications from S3. Runs on page load
async function loadQualification() {
    try {
        userSession.clearErrorBar();

        //Variables
        ///Array containing the data pulled from the file system
        var qualifications = [];

        ///The api to be called to get the qualifications
        var api = apiRoot + "/filters";


        //Updating the page
        ///Awaits the qualifications from the API call
        qualifications = await getAPIGetResult(api, "qualifications");

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
    uri = apiRoot + "/filters?filePath=" + filePath;

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
        userSession.clearErrorBar();

        //Variables
        ///Array containing the data pulled from the file system
        var examBoards = [];

        ///The file path of the qualification, therefore the location of the index file containing the exam boards
        userSession.filePath = encodeURIComponent($("#qualification").val()) + "/";

        ///Variable containing the api to be called for the exam boards
        var api = filterAPI(userSession.filePath, false);


        //Updating the page
        ///Awaits the API call and therefore the exam boards
        examBoards = await getAPIGetResult(api, "exam boards");

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
        userSession.clearErrorBar();

        //Variables
        ///Array containing the data pulled from the file system
        var subjects = [];

        ///The file path of the qualification, therefore the location of the index file containing the subjects
        userSession.filePath = encodeURIComponent($("#qualification").val()) + "/" + encodeURIComponent($("#examBoard").val()) + "/";

        ///Variable containing the api to be called for the subjects
        var api = filterAPI(userSession.filePath, false);


        //Updating the page
        ///Awaits the API call and therefore the subjects
        subjects = await getAPIGetResult(api, "subjects");

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
        userSession.clearErrorBar();

        //Variables
        ///Array containing the topics pulled from the file system
        var topics = [];

        ///The file path of the topics file
        userSession.filePath = encodeURIComponent($("#qualification").val()) + "/" + encodeURIComponent($("#examBoard").val()) + "/" + encodeURIComponent($("#subject").val()) + "/";

        ///The api to be called to get the topics file for the correct subject
        var api = filterAPI(userSession.filePath, true);


        //Get topics
        ///Awaits the topic file from S3
        topics = await getAPIGetResult(api, "topics");

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
        userSession.clearErrorBar();

        //Variables
        ///Stores whether the boxes are to be checked or unchecked
        var isSelected = $("#" + boxID).prop("checked");


        //Selection
        ///Changes the checked property of every check box in the topic-select class to the value in isSelected
        $(".topic-select input[type='checkbox']").prop('checked', isSelected);


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
        userSession.clearErrorBar();

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

//The onclick for the start questions button - handles loading the questions from the API and modifying the web page to show the user the question form
async function startQuestions() {
    try {
        userSession.clearErrorBar();

        //Disable the button
        ///Prevents double-clicks which cause generation bugs
        $(".btn-questions").attr("disabled", "disabled");


        //Variables
        ///Object to store the parameters for the questions API - the body for the POST interface
        var postBody = {};

        ///Stores whether the user wants the timer to be shown in the user session (only shown since the timer can be used for teacher analytics)
        userSession.isTimerShown = $("#timer-check").prop("checked");

        ///The number of questions to be generated - taken from user input. Stored in the user session and the post body
        userSession.numOfQuestions = $("#numberOfQuestions").val()
        postBody.numOfQuestions = userSession.numOfQuestions

        ///The location of the questions inside the object store. Customised by user choices, set by user choices. Test data prevents unnecessary API calls
        //userSession.filePath = "iGCSE/Cambridge/Computer Science/";
        userSession.filePath = $("#qualification").val() + "/" + $("#examBoard").val() + "/" + $("#subject").val() + "/";
        postBody.filePath = userSession.filePath;

        ///The topics that the questions may come from - stored in the post body
        postBody.topics = compileTopics();

        ///The full api to be called for questions
        var api = compileQuestionAPI();


        //Data handling
        ///A temporary object to store all of the input from the api, once the data has been returned. Test data prevents unnecessary APi calls whilst having all question types
        //var results = {"questions": {"questions": [{"type": "boxMatch","numAnswers": "3","text": [{"q": "Match the denary with their binary values:"},{"q": "23"},{"q": "00010111"},{"q": "96"},{"q": "01101111"},{"q": "111"},{"q": "01100000"}]},{"type": "boxMatch","numAnswers": "4","text": [{"q": "Match the values to their equivalent:"},{"q": "10KB"},{"q": "16 bits"},{"q": "5MB"},{"q": "8 nibbles"},{"q": "4 bytes"},{"q": "81920 bits"},{"q": "2 bytes"},{"q": "5242880 bytes"}]},{"type": "gapFill","numAnswers": "1","text": [{"q": "The byte is a unit used to measure ______ size."}]},{"type": "calculation","numAnswers": "1","text": [{"q": "11011011 in denary?"}]},{"type": "multipleChoice","numAnswers": "3","text": [{"q": "Which of the following are valid storage units?"},{"q": "Bit"},{"q": "Gigantabyte"},{"q": "Nibble"},{"q": "Nanobyte"},{"q": "Megabyte"}]}],"indexes": ["0022","0023","0016","0008","0013"]}};
        var results = await getAPIPostResult(api, postBody);
        
        ///Logging for testing
        //console.log(JSON.stringify(results.questions));

        ///Populating the user session object with the data from the api call
        userSession.questions = results.questions.questions;

        ///For each question 
        for(var i = 0; i < userSession.numOfQuestions; i++)
        {
            ///Apply the index to the question in user session (the object structure is different client side and server side)
            userSession.questions[i].index = results.questions.indexes[i];
        }
        

        //Updating the user display
        displayQuestionScreen();
    } catch (error) {
        //Fixing site changes
        $(".btn-questions").removeAttr("disabled");
        $("#frm-filter").show();
        $("#frm-questions").hide();

        //Error messages
        console.log("error");
        generateErrorBar(error);
    }
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

//Takes in a number of questions and returns a formatted REST api with a POST method to be called for question data 
function compileQuestionAPI() {
    //Variables
    ///The string that will contain the uri, to be returned at the end of the function
    var uri = "";
    

    //Concatenating URI
    ///Takes the api root, the number of questions and the file path and creates a uri for the api
    uri = apiRoot + "/questions";

    ///For testing 
    //console.log(uri);

    return uri;
}

//A function to get the results from a REST api with a POST method
///api: the api to get results from
///postBody: the data to be posted
async function getAPIPostResult(api, postBody) {
    //Get result
    ///Uses a promise structure to allow the use of the await keyword when calling the function. Easy way of making asynchronous code synchronous in javascript 
    return new Promise((resolve, reject) => {
        ///Uses jquery to easily call the api, passes in the API, the post body, a callback function and the format of the post body
        $.post(api, JSON.stringify(postBody), data => {
            resolve(data);
        }).fail((error) => {
            reject("There was an error retrieveing questions from our servers. Please check your internet connection and try again later. Error: " + error.responseText);
        }, "json");
    });
}

//A function to get the results from a REST api with a GET method
///api: the api to get results from
async function getAPIGetResult(api, apiResults) {
    //Get result
    ///Uses a promise structure to allow the use of the await keyword when calling the function. Easy way of making asynchronous code synchronous in javascript 
    return new Promise((resolve, reject) => {
        ///Uses jquery to easily call the api, takes in the APi and a callback function
        $.get(api, html => {
            resolve(html);
        }).fail((error) => {
            reject("There was an error retrieving " + apiResults + " from our servers. Please check your internet connection and try again later. <br> Error: " + error.responseText);
        });
    });
}

//Updates the user's screen to show questions
function displayQuestionScreen() {  
    //Update screen
    ///All HTML indexes use jquery to make the code 4 times neater and easier

    ///Hide the filter form
    $("#frm-filter").hide();
    ///Show the question form
    $("#frm-questions").show();


    //Variable updates
    ///For each question:
    for(var i = 0; i < userSession.numOfQuestions; i++) {
        ///Append a question block to the question bar
        $("#question-bar").append("<div class='question-block' id='question-block" + i + "' onclick='displayQuestion(" + i + ")'>" + (i + 1) + "<div id='question-block-bookmark" + i + "' class='question-bookmark-space'><i class='ion-android-star bookmark' id='bookmark" + i + "'></i></div></div>");
        
        ///Hide the bookmark star of the question block
        $("#bookmark" + i).hide();

        ///Create an array of user answers that corresponds to the number of answers required 
        userSession.questions[i].userAnswers = new Array(parseInt(userSession.questions[i].numAnswers)).fill("");

        ///If the question is a box match question
        if(userSession.questions[i].type === "boxMatch")
        {
            ///Loop for the number of answers
            for(var j = 0; j < userSession.questions[i].numAnswers; j++)
            {
                ///Add the answer text to the user answers array for that question
                userSession.questions[i].userAnswers[j] = userSession.questions[i].text[(j + 1) * 2].q;
            }
        }

        ///Set the timer to 0 
        userSession.questions[i].timer = 0;

        ///Set bookmarked to false
        userSession.questions[i].isBookmarked = false;
    }

    ///Sets current question in the user session to -1, used to skip saving the current question in the page update function
    userSession.currentQuestion = -1;

    ///Displays the first question
    displayQuestion(0);

    ///Starts the timer
    startTimer();
}

//Updates the question form to display a given question
///index: the array index of the question that is to be changed to
function displayQuestion(index) {
    try {
        userSession.clearErrorBar();

        //Update features
        ///Change the question title to display the correct number
        $("#question-title").text("Question " + (index + 1));

        ///Update the question text to be the new question
        $("#question-text").text(userSession.questions[index].text[0].q);

        ///Remove the class "selected-block" from all question blocks
        $(".question-block").removeClass("selected-block");

        ///Add the class "selected-block" to the block that corresponds to the current question
        $("#question-block" + index).addClass("selected-block")

        ///Change the user answer console to display the correct question in the correct framework
        displayAnswerConsole(index);


        //Update the current question in the user object
        userSession.currentQuestion = index;


        //Edit button functionality
        ///Make both next and previous buttons work
        $(".btn-prev").removeAttr("disabled");
        $(".btn-next").removeAttr("disabled");

        ///Hide the submit answers button
        $(".ans-button").hide();

        ///If on question 1 
        if(index == 0) {
            //Disable the previous button
            $(".btn-prev").attr("disabled", "disabled");
        } else if (index === userSession.numOfQuestions - 1) { 
            ///If on last question disable the next button
            $(".btn-next").attr("disabled", "disabled");

            ///Show the submit button
            $(".ans-button").show();
        }

        ///Update the bookmark button to the correct state
        updateBookmarkButton();

        //Select the answer box
        $("#answer-box0").focus();
    } catch (error) {
        generateErrorBar(error);
    }
}

//Updates the user answer console, saving the current user answers and 
function displayAnswerConsole(index) {
    if(userSession.currentQuestion != -1) {
        storeAnswer();
    }

    $("#user-input").empty();

    switch(userSession.questions[index].type) {
        case "multipleChoice":
            loadMultipleChoice(index);
            break;

        case "boxMatch":
            loadBoxMatch(index);
            break;

        default:
            loadBasicQuestion(index)
            break;
    }
}

function storeAnswer() {
    switch(userSession.questions[userSession.currentQuestion].type) {
        case "multipleChoice":
            storeMultipleChoice();
            break;

        case "boxMatch":
            storeBoxMatch();
            break;

        default:
            storeBasicQuestion();
            break;
    }
}

function storeMultipleChoice() {
    userSession.questions[userSession.currentQuestion].userAnswers = [];

    $(".multiple-choice-box").each((index, element) => {
        if($(element).prop('checked')){
            userSession.questions[userSession.currentQuestion].userAnswers.push($(element).val());
        }
    });
}

function storeBoxMatch() {
    ///Store the  text in the answer box as a user answer
    for(var i = 0; i < userSession.questions[userSession.currentQuestion].userAnswers.length; i++) { 
        userSession.questions[userSession.currentQuestion].userAnswers[i] = $("#answer-box" + i).text().trim();
    }
}

function storeBasicQuestion() {
    ///Store the  text in the answer box as a user answer
    for(var i = 0; i < userSession.questions[userSession.currentQuestion].userAnswers.length; i++) { 
        userSession.questions[userSession.currentQuestion].userAnswers[i] = $("#answer-box" + i).val().trim();
    }
}

function loadMultipleChoice(index) {
    for(var i = 1; i < userSession.questions[index].text.length; i++)
    {
        var tempText = userSession.questions[index].text[i].q;

        $("#user-input").append('<input type="checkbox" class="multiple-choice-box check-box" value="' + tempText + '" id="answer-box' + (i - 1) + '"/>');
        $("#user-input").append('<label class="answer-box-label" for="answer-box' + (i - 1) + '">' + tempText + '</label><br/>');

        if(userSession.questions[index].userAnswers.includes(tempText)){
            $("#answer-box" + (i - 1)).prop('checked', true);
        }
    }
}

function loadBoxMatch(index) {
    var boxMatch = [];
    var loopLength = (userSession.questions[index].text.length - 1)/2;

    boxMatch.push(
        '<div class="row">',
        '<div class="col-sm-6">'
    );

    for(var i = 1; i < loopLength + 1; i++)
    {
        boxMatch.push('<label class="drag-label">' + userSession.questions[index].text[(2 * i - 1)].q + '</label><br/>');
    }

    boxMatch.push(
        '</div>',
        '<div class="col-sm-6">',
        '<div class="drag-list">'
    );

    for(var i = 0; i < loopLength; i++)
    {
        boxMatch.push('<div class="drag-item" draggable="true"><label id="answer-box' + i + '">' + userSession.questions[index].userAnswers[i] + '</label><i class="ion-drag drag-symbol"></i></div>');
    }

    boxMatch.push(
        '</div>',
        '</div>',
        '</div>',
        '</div>'
    );

    $("#user-input").append(boxMatch.join(""));

    setTimeout(() => initDrag(), 0);
}

function loadBasicQuestion(index) {
    for(var i = 0; i < parseInt(userSession.questions[index].numAnswers); i++){
        $("#user-input").append("<input class='form-control' id='answer-box" + i + "' type='text'></input>");
        ///Update the answer box with the current user answer for the new question
        $("#answer-box" + i).val(userSession.questions[index].userAnswers[i]);
    }
}

function startTimer() {
    userSession.timerStart = Date.now();

    userSession.timer = setInterval(() => {                
        setInterval(function() {
            userSession.questions[userSession.currentQuestion].timer += Date.now() - userSession.timerStart;
            userSession.timerStart = Date.now();
        }, 10);

        if(userSession.isTimerShown){
            $("#question-timer").text(timerToText(userSession.questions[userSession.currentQuestion].timer));
        }
    }, 500);
}

function endTimer() {
    clearInterval(userSession.timer);

    userSession.totalTime = 0;

    userSession.questions.forEach((element) => {
        userSession.totalTime += element.timer;
    });
}

function timerToText(input) {
    //Variables
    ///
    var timer = parseInt(input);

    ///
    var output = "";


    //Calculations
    ///base in milliseconds .'. 1
    ///seconds = 1 * 1000 .'. MOD 1000
    ///minutes = 1000 * 60 .'. MOD 60,000
    ///hours = 60,000 * 60 .'. MOD 3,600,000

    //Display handling
    ///
    if(timer % 3600000 != timer){
        ///
        output += Math.floor(timer / 3600000) + "h ";

        ///
        timer = timer % 3600000;
    }

    ///
    if(timer % 60000 != timer){
        ///
        output += Math.floor(timer / 60000) + "m ";

        ///
        timer = timer % 60000;
    }

    ///
    output += Math.floor(timer / 1000) + "s ";

    return output;
}

//Bookmark a question for the user
function bookmarkQuestion(){
    try {
        if(userSession.questions[userSession.currentQuestion].isBookmarked) {
            userSession.questions[userSession.currentQuestion].isBookmarked = false;
            $("#bookmark" + userSession.currentQuestion).hide();
        } else {
            userSession.questions[userSession.currentQuestion].isBookmarked = true;
            $("#bookmark" + userSession.currentQuestion).show();
        }

        $("#answer-box0").focus();

        updateBookmarkButton();
    } catch (error) {
        generateErrorBar(error);
    }
}

function updateBookmarkButton() {
    if(userSession.questions[userSession.currentQuestion].isBookmarked) {
        $("#btn-bookmark").empty();
        $("#btn-bookmark").append('Bookmark');
        $("#btn-bookmark").append('<i class="ion-android-star bookmark"></i>');
    } else {
        $("#btn-bookmark").empty();
        $("#btn-bookmark").append('Bookmark');
        $("#btn-bookmark").append('<i class="ion-android-star-outline bookmark"></i>');
    }
}

//Select the previous question
function selectPrevQuestion() {
    try {
        //Change question
        ///Find out the current question
        var index = userSession.currentQuestion;

        if(index > 0) {
            ///If you can go to a previous question then do so. Backup checking in case button doesn't disable correctly
            displayQuestion(index - 1);
        }
    } catch (error) {
        generateErrorBar(error);
    }
}

//Select the next question
function selectNextQuestion() {
    try {
        //Change question
        ///Find out the current question
        var index = userSession.currentQuestion;

        if(index < userSession.numOfQuestions - 1) {
            ///If you can go to a nexy question then do so. Backup checking in case button doesn't disable correctly
            displayQuestion(index + 1);
        }
    } catch (error) {
        generateErrorBar(error);
    }
}

//The onclick for the submit answers button - handles loading the answers from the API, marking the questions and modifying the web page to show the user the answer form
async function submitAnswers() {
    try {
        userSession.generateErrorBar();

        //Disable button
        $(".btn-submit").attr("disabled", "disabled");

        endTimer();

        //Variables
        ///Makes sure the current user change is recorded
        storeAnswer();

        ///The full api to be called for the correct answers
        var api = compileAnswerAPI();

        ///A temporary object to store the results from the api call
        var response = {"answers":[[{"a":"00010111"},{"a":"01100000"},{"a":"01101111"}],[{"a":"81920 bits"},{"a":"5242880 bytes"},{"a":"8 nibbles"},{"a":"16 bits"}],[{"a":"memory"},{"a":"storage"}],[{"a":"219"}],[{"a":"Nibble"},{"a":"Bit"},{"a":"Megabyte"}]]};
        //var response = await getAPIGetResult(api, "answers");
        //console.log(JSON.stringify(response));

        ///Updating the user session object with the correct answers from the object store
        for(var i = 0; i < userSession.numOfQuestions; i++)
        {
            userSession.questions[i].correctAnswers = [];

            for(var j = 0; j < response.answers[i].length; j++)
            {
                userSession.questions[i].correctAnswers.push(response.answers[i][j].a);
            }

            ///Populates the user session object with an initialised array containing whether each question is correct
            userSession.questions[i].isCorrect = false;
        }

        //Answer handling
        ///Marking the answers
        markAnswers();

        ///Displaying the answers form
        displayAnswerScreen();
    } catch (error) {
        $(".btn-submit").removeAttr("disabled");
        $("#frm-questions").show();
        $("#frm-answers").hide();

        console.log("error");
        generateErrorBar(error);
    }
}

//A function that uses the user session object to make a uri for the answers api
function compileAnswerAPI() {
    //URI generation
    ///A variable to store the uri generated by the function. To be returned
    var uri = "";
    
    ///Loading the variable with the api root, the correct resource and the file path
    uri = apiRoot + "/answers?filePath=" + userSession.filePath;

    ///Loads the uri with the question indexes. Uses multiQueryStringParameters instead of the standard queryStringParameters, hence the repetition of index assignments instead of square brackets
    for (var i = 0; i < userSession.numOfQuestions; i++) {
        uri += "&indexes=" + userSession.questions[i].index;
    }

    ///For testing
    //console.log(uri);

    return uri;
}

//Compares the user answers to the correct answers
function markAnswers() {
    //Comparing
    ///Populates user session with a number containing the number of correct answers
    userSession.numCorrect = 0;

    ///Loops through each question
    for (var i = 0; i < userSession.numOfQuestions; i++) {
        if(!userSession.questions[i].userAnswers.includes("") && userSession.questions[i].userAnswers.length != 0)
        {
            var allCorrect = true;

            if(userSession.questions[i].type === "boxMatch")
            {
                if(userSession.questions[i].userAnswers != userSession.questions[i].correctAnswers)
                {
                    allCorrect = false;
                }
            } else if (userSession.questions[i].type === "multipleChoice") {
                for(var j = 0; j < userSession.questions[i].userAnswers.length; j++)
                {
                    ///If the user answer is the same as the correct answer
                    if(!userSession.questions[i].correctAnswers.includes(userSession.questions[i].userAnswers[j])) {
                        allCorrect = false;
                    }
                }            
            } else {
                for(var j = 0; j < userSession.questions[i].userAnswers.length; j++)
                {
                    ///If the user answer is the same as the correct answer
                    if(!userSession.questions[i].correctAnswers.includes(userSession.questions[i].userAnswers[j].toLowerCase())) {
                        allCorrect = false;
                    }
                }
            }

            if(allCorrect) {
                ///Update the user session to show that this question is correct
                userSession.questions[i].isCorrect = true;
                userSession.numCorrect++;
            }
        }
    }
}

//Displays/generates the answer form
function displayAnswerScreen() {
    //Constants
    ///The score boundary for red text
    const lowScore = 0.33;
    ///The score boundary for amber text
    const mediumScore = 0.66;

    //Feature updates
    ///Hides the question form
    $("#frm-questions").hide();
    ///Shows the answer form
    $("#frm-answers").show();

    ///Displays the number of correct questions
    $("#user-score-value").text(userSession.numCorrect);
    ///Displays the total number of questions
    $("#total-score-value").text(userSession.numOfQuestions);

    //Colour co-ordination
    if(userSession.numCorrect/userSession.numOfQuestions <= lowScore) {
        ///If below red boundary then show red text and corresponding message
        $("#user-score-value").addClass("red-text");
        $("#user-message").addClass("red-text");
        $("#user-message").text("Good Effort!");
    } else if(userSession.numCorrect/userSession.numOfQuestions <= mediumScore) {
        ///Else if below amber boundary display amber text and corresponding message
        $("#user-score-value").addClass("amber-text");
        $("#user-message").addClass("amber-text");
        $("#user-message").text("Good Results!");
    } else {
        ///Else use green text
        $("#user-score-value").addClass("green-text");
        $("#user-message").addClass("green-text");
        if(userSession.numCorrect/userSession.numOfQuestions === 1)
        {
            ///If 100% display special message
            $("#user-message").text("Brilliant!");
        } else {
            ///Else use standard green text message
            $("#user-message").text("Well Done!");
        }
    }

    //Form generation
    ///For each question add an answer block to the page
    for (var i = 0; i < userSession.numOfQuestions; i++) {
        $("#answer-container").append(buildAnswerDiv(i));
    }
}

//Generates an answer block for a given question
///index: the index for the question that the block is being generated for
function buildAnswerDiv(index) {
    //Variables
    ///A string array for each line of the box. To be combined then returned at the end of the function.
    var answerDiv = [];
    ///The line that shows the red cross or green tick. Standard is red cross, changed to green tick by subsequent if statement if the user got the question correct

    var headerBar = [];

    if(userSession.isTimerShown){
        var imageLine = '<div class="col-sm-2"><i class="ion-close-round red-text symbol"></i></div>';

        if(userSession.questions[index].isCorrect){
            imageLine = '<div class="col-sm-2"><i class="ion-checkmark-round green-text symbol"></i></div>'
        }

        headerBar.push(
            ///Question number
            '<div class="col-sm-1 question-number">' + (index + 1) + '</div>',
            ///Question id
            '<div class="col-sm-2 question-id">' + convertQuestionIndex(index) + '</div>',
            '<div class="col-sm-5 question-time">' + timerToText(userSession.questions[index].timer) + '</div>',
            imageLine,
            ///Both the up and down arrows - correct arrow for the current state is shown by CSS styling
            '<div class="col-sm-2"><i class="ion-android-arrow-dropdown-circle symbol"></i><i class="ion-android-arrow-dropup-circle symbol"></i></div>',
        );
    } else {
        var imageLine = '<div class="col-sm-3"><i class="ion-close-round red-text symbol"></i></div>';

        if(userSession.questions[index].isCorrect){
            imageLine = '<div class="col-sm-3"><i class="ion-checkmark-round green-text symbol"></i></div>'
        }

        headerBar.push(
            ///Question number
            '<div class="col-sm-3 question-number">' + (index + 1) + '</div>',
            ///Question id
            '<div class="col-sm-3 question-id">' + convertQuestionIndex(index) + '</div>',
            imageLine,
            ///Both the up and down arrows - correct arrow for the current state is shown by CSS styling
            '<div class="col-sm-3"><i class="ion-android-arrow-dropdown-circle symbol"></i><i class="ion-android-arrow-dropup-circle symbol"></i></div>',
        );
    }

    //Div generation
    ///A push command for every line
    answerDiv.push(
        ///Whole box styling
        '<div class="question-box" id="question-box' + index + '">',
            ///Header bar - controls collapse section and is always shown
            '<div class="row header-bar" id="header-bar' + index + '" data-toggle="collapse" data-target="#answer-bar' + index + '" aria-expanded="false" aria-controls="answer-bar' + index + '">',
                headerBar.join(""),
            '</div>',
            ///Collapsed section
            '<div class="answer-bar collapse" id="answer-bar' + index + '">',
                '<div class="row">',
                    '<div class="col-xs-12">',
                        ///The question text TODO multi question etc                  
                        '<div class="question-text" id="question-text' + index + '">' + userSession.questions[index].text[0].q + '</div>',
                    '</div>',
                '</div>',
                '<div class="marked-answers">',
                    '<div class="row">',
                        '<div class="col-xs-12">',
                            ///User answer(s)
                            '<p>You answered:</p>',
                            displayAnswerText(index, userSession.questions[index].userAnswers, "user-answer"),
                        '</div>',
                    '</div>',
                    '<div class="row">',
                        '<div class="col-xs-12">',
                            ///Correct answer(s)
                            '<p>Correct answer(s):</p>',
                            displayAnswerText(index, userSession.questions[index].correctAnswers, "marked-answer"),
                        '</div>',
                    '</div>',
                '</div>', 
            '</div>',
        '</div>'
    );

    ///Combines every element of the array into one string and returns it
    return answerDiv.join("");
}

function convertQuestionIndex(index) {
    var fileIndex = "";
    var filePath = userSession.filePath;

    for(var i = 0; i < 3; i++)
    {
        fileIndex += filePath[0];
        filePath = filePath.substring(filePath.indexOf("/") + 1);
    }

    fileIndex += userSession.questions[index].index;

    return fileIndex;
}

function displayAnswerText(index, answerSet, idStem) {
    var output = "";

    switch (userSession.questions[index].type){
        case "multipleChoice":
            output = displayMultipleChoice(index, answerSet, idStem);
            break;

        case "boxMatch":
            output = displayBoxMatch(index, answerSet, idStem);
            break;

        default:
            output = displayBasicQuestion(index, answerSet, idStem);
            break;
    }

    return output;
}

function displayMultipleChoice(index, answerSet, idStem) {
    var multChoice = [];

    for(var i = 1; i < userSession.questions[index].text.length; i++)
    {
        var tempText = userSession.questions[index].text[i].q;

        if(answerSet.includes(tempText))
        {
            multChoice.push('<input type="checkbox" class="multiple-choice-box check-box" checked="true" value="' + tempText + '" id="' + idStem + index + '.' + (i - 1) + '"disabled/>');
        } else {
            multChoice.push('<input type="checkbox" class="multiple-choice-box check-box" value="' + tempText + '" id="' + idStem + index + '.' + (i - 1) + '"disabled/>');
        }

        multChoice.push('<label class="answer-box-label" for="' + idStem + index + '.' + (i - 1) + '">' + tempText + '</label><br/>');
    }

    return multChoice.join("");
}

function displayBoxMatch(index, answerSet, idStem) {
    var boxMatch = [];
    var loopLength = (userSession.questions[index].text.length - 1)/2;

    boxMatch.push(
        '<div class="row">',
        '<div class="col-sm-6">'
    );

    for(var i = 1; i < loopLength + 1; i++)
    {
        boxMatch.push('<label class="drag-label">' + userSession.questions[index].text[(2 * i - 1)].q + '</label><br/>');
    }

    boxMatch.push(
        '</div>',
        '<div class="col-sm-6">',
        '<div class="drag-list">'
    );

    for(var i = 0; i < loopLength; i++)
    {
        boxMatch.push('<div class="drag-label"><label id="' + idStem + index + "." + i + '">' + answerSet[i] + '</label></div>');
    }

    boxMatch.push(
        '</div>',
        '</div>',
        '</div>'
    );

    return boxMatch.join("");
}

function displayBasicQuestion(index, answerSet, idStem) {
    var answerBox = [];

    for(var i = 0; i < answerSet.length; i++){
        answerBox.push('<input class="form-control" id="' + idStem + index + "." + i + '" type="text" readonly value="' + answerSet[i] + '"></input>');
        ///Update the answer box with the current user answer for the new question
    }

    return answerBox.join("");
}

//Runs when the code loads - the timeout buffers until the full page loads
///Runs the initialise function in case more than one function call is needed
window.onload = setTimeout(() => initialise(), 1);

//Runs when the page loads
function initialise(){
    //Function calls
    ///Loads the qualification values into the input box
    loadQualification();
}