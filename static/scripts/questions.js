//Global variables
///Stores the root of the api for retrieveing questions and answers
const apiRoot = "https://r8d4v61idi.execute-api.eu-west-2.amazonaws.com/live";

///Stores user data throughout the running of the website
var userSession = {};

//The onclick for the start questions button - handles loading the questions from the API and modifying the web page to show the user the question form
async function startQuestions(){
    //Disable the button
    ///Prevents double-clicks which cause generation bugs
    $(".btn-questions").attr("disabled", "disabled");

    //Variables
    ///The number of questions to be generated - taken from user input
    var postBody = {};
    postBody.numOfQuestions = $("#numberOfQuestions").val();

    ///The location of the questions inside the object store. Uses standard URI encoding. To be customisable in stage 2
    userSession.filePath = "iGCSE/Cambridge/Computer Science/";
    postBody.filePath = userSession.filePath;
    //postBody.topics = compileThemes();

    ///The full api to be called for questions
    var api = compileQuestionAPI();


    ///A temporary object to store all of the input from the api, once the data has been returned
    console.log(JSON.stringify(postBody))
    //var results = await getPostAPIResult(api, postBody);
    //console.log(results);

    ///A way of filling the results object with data for testing without calling the api
    var results = {"questions": {"questions": [{"type": "calculation","numAnswers": "1","text": [{"q": "01001010 in denary?"}]},{"type": "gapFill","numAnswers": "1","text": [{"q": "Binary numbers are stored using base __."}]},{"type": "multipleChoice","numAnswers": "2","text": [{"q": "Which of these are equivalent to 8KB?"},{"q": "16384 nibbles"},{"q": "1/128 MB"},{"q": "0.128 MB"},{"q": "80008 bits"}]},{"type": "gapFill","numAnswers": "2","text": [{"q": "Megabytes are each worth ____ kilobytes, which are each worth ____ bytes."}]},{"type": "stringMatch","numAnswers": "2","text": [{"q": "What are the digits in a binary number?"}]}],"indexes": ["0010","0020","0014","0019","0002"]}};
    //console.log(JSON.stringify(results.questions));


    ///Populating the user session object with the data from the api call
    userSession.questions = results.questions.questions;
    userSession.indexes = results.questions.indexes;

    ///Declaring an array of length numOfQuestions - populated with empty strings. Prevents index errors and allows for re-doing questions 
    userSession.userAnswers = new Array(postBody.numOfQuestions).fill([]);

    //Updating the user display
    displayQuestionScreen();
}

function compileThemes() {
    var themes = [];

    $(".child-box").each(function(index, element) {
        if($(element).prop('checked')){
            themes.push($(element).attr("id"));
        }
    });

    return themes;
}

//Takes in a number of questions and returns a fully formatted question api to be called for data 
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

async function getPostAPIResult(api, postBody) {
    //console.log(api);

    //Get result
    ///Uses jquery to easily call the api
    return new Promise((resolve, reject) => {
        $.post(api, JSON.stringify(postBody), data => {
            resolve(data)
        }, "json");
    });
}

//A function to get the results from a given api
///api: the api to get results from
async function getAPIGetResult(api) {
    //console.log(api);

    //Get result
    ///Uses a promise structure to allow the use of the await keyword when calling the function. Easy way of making asyncronous code syncronous in javascript 
    return new Promise((resolve, reject) => {
        ///Uses jquerey to easily call the api
        $.get(api, html => {
            resolve(html)
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

    ///Generates the appropriate number of question blocks for the question bar and implements them
    for(var i = 0; i < userSession.questions.length; i++) {
        $("#question-bar").append("<div class='question-block' id='question-block" + i + "' onclick='displayQuestion(" + i + ")'>" + (i + 1) + "</div>");

        userSession.userAnswers[i] = new Array(parseInt(userSession.questions[i].numAnswers)).fill("");
    }

    userSession.currentQuestion = -1;

    ///Displays the first question
    displayQuestion(0);
}

//Updates the question form to display a given question
///index: the array index of the question that is to be changed to
function displayQuestion(index) {
    //Update features
    ///Change the question title to display the correct number
    $("#question-title").text("Question " + (index + 1));
    ///Update the question text to be the new question
    $("#question-text").text(userSession.questions[index].text[0].q);
    ///Remove the class "selected-block" from all question blocks
    $(".question-block").removeClass("selected-block");
    ///Add the class "selected-block" to the block that corresponds to the current question
    $("#question-block" + index).addClass("selected-block")

    displayAnswerConsole(index);

    //Update the current question in the user object
    userSession.currentQuestion = index;

    //Edit button functionality
    ///Make both next and previous buttons work
    $(".btn-prev").removeAttr("disabled");
    $(".btn-next").removeAttr("disabled");
    ///Hide the submit answers button
    $(".ans-button").hide();

    if(index == 0) {
        ///If on question 1 disable the previous button
        $(".btn-prev").attr("disabled", "disabled");
    } else if (index === userSession.questions.length - 1) { 
        ///Else if on last question disable the next button and show the submit button
        $(".btn-next").attr("disabled", "disabled");
        $(".ans-button").show();
    }

    //Select the answer box
    $("#answer-box0").focus();
}

function displayAnswerConsole(index) {
    if(userSession.currentQuestion != -1){
        switch(userSession.questions[userSession.currentQuestion].type)
        {
            case "multipleChoice":
                storeMultipleChoice();
                break;

            case "boxMatch":
                break;

            default:
                storeBasicQuestion();
                break;
        }
    }

    $("#user-input").empty();

    switch(userSession.questions[index].type)
    {
        case "multipleChoice":
            loadMultipleChoice(index);
            break;

        case "boxMatch":
            break;

        default:
            loadBasicQuestion(index)
            break;
    }
}

function storeMultipleChoice() {
    userSession.userAnswers[userSession.currentQuestion] = [];

    $(".multiple-choice-box").each((index, element) => {
        if($(element).prop('checked')){
            userSession.userAnswers[userSession.currentQuestion].push($(element).val());
        }
    });
}

function storeBasicQuestion() {
    ///Store the  text in the answer box as a user answer
    for(var i = 0; i < userSession.userAnswers[userSession.currentQuestion].length; i++) { 
        userSession.userAnswers[userSession.currentQuestion][i] = $("#answer-box" + i).val().trim();
    }
}

function loadMultipleChoice(index) {
    for(var i = 1; i < userSession.questions[index].text.length; i++)
    {
        var tempText = userSession.questions[index].text[i].q;

        $("#user-input").append('<input type="checkbox" class="multiple-choice-box check-box" value="' + tempText + '" id="answer-box' + (i - 1) + '"/>');
        $("#user-input").append('<label class="answer-box-label" for="answer-box' + (i - 1) + '">' + tempText + '</label><br/>');

        if(userSession.userAnswers[index].includes(tempText)){
            $("#answer-box" + (i - 1)).prop('checked', true);
        }
    }
}

function loadBasicQuestion(index) {
    for(var i = 0; i < parseInt(userSession.questions[index].numAnswers); i++){
        $("#user-input").append("<input class='form-control' id='answer-box" + i + "' type='text'></input>");
        ///Update the answer box with the current user answer for the new question
        $("#answer-box" + i).val(userSession.userAnswers[index][i]);
    }
}

//Bookmark a question for the user
function bookmarkQuestion(){
    //To be done in future
}

//Select the previous question
function selectPrevQuestion() {
    //Change question
    ///Find out the current question
    var index = userSession.currentQuestion;

    if(index > 0) {
        ///If you can go to a previous question then do so. Backup checking in case button doesn't disable correctly
        displayQuestion(index - 1);
    }
}

//Select the next question
function selectNextQuestion() {
    //Change question
    ///Find out the current question
    var index = userSession.currentQuestion;

    if(index < userSession.questions.length - 1) {
        ///If you can go to a nexy question then do so. Backup checking in case button doesn't disable correctly
        displayQuestion(index + 1);
    }
}

//The onclick for the submit answers button - handles loading the answers from the API, marking the questions and modifying the web page to show the user the answer form
async function submitAnswers() {
    //Disable button
    $(".btn-submit").attr("disabled", "disabled");

    //Variables
    ///Makes sure the current user change is recorded
    userSession.userAnswers[userSession.currentQuestion] = $("#answer-box").val();

    ///Test data instead of using the api
    //userSession.correctAnswers = [ "a", "concatenation", "b", "c", "d"]
    //userSession.correct = [false, true, true, false, false];

    ///The full api to be called for the correct answers
    var api = compileAnswerAPI();
    ///A temporary object to store the results from the api call
    var response = await getAPIGetResult(api);

    ///Updating the user session object with the correct answers from the object store
    userSession.correctAnswers = response.answers;

    //Answer handling
    ///Marking the answers
    markAnswers();

    ///Displaying the answers form
    displayAnswerScreen();
}

//A function that uses the user session object to make a uri for the answers api
function compileAnswerAPI() {
    //URI generation
    ///A variable to store the uri generated by the function. To be returned
    var uri = "";
    
    ///Loading the variable with the api root, the correct resource and the file path
    uri = apiRoot + "/answers?filePath=" + userSession.filePath;

    ///Loads the uri with the question indexes. Uses multiQueryStringParameters instead of the standard queryStringParameters, hence the repetition of index assignments instead of square brackets
    for (var i = 0; i < userSession.questions.length; i++) {
        uri += "&indexes=" + userSession.indexes[i];
    }

    ///For testing
    //console.log(uri);

    return uri;
}

//Compares the user answers to the correct answers
function markAnswers() {
    //Comparing
    ///Populates the user session object with an initialised array containing whether each question is correct
    userSession.correct = new Array(5).fill(false);
    ///Populates user session with a number containing the number of correct answers
    userSession.numCorrect = 0;

    ///Loops through each question
    for (var i = 0; i < userSession.questions.length; i++) {
        ///If the box has been looked at
        if(userSession.userAnswers[i] != undefined)
        {
            ///If the user answer is the same as the correct answer
            if(userSession.userAnswers[i].toLowerCase() === userSession.correctAnswers[i]) {
                ///Update the user session to show that this question is correct
                userSession.correct[i] = true;
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
    $("#total-score-value").text(userSession.questions.length);

    //Colour co-ordination
    if(userSession.numCorrect/userSession.questions.length <= lowScore) {
        ///If below red boundary then show red text and corresponding message
        $("#user-score-value").addClass("red-text");
        $("#user-message").addClass("red-text");
        $("#user-message").text("Good Effort!");
    } else if(userSession.numCorrect/userSession.questions.length <= mediumScore) {
        ///Else if below amber boundary display amber text and corresponding message
        $("#user-score-value").addClass("amber-text");
        $("#user-message").addClass("amber-text");
        $("#user-message").text("Good Results!");
    } else {
        ///Else use green text
        $("#user-score-value").addClass("green-text");
        $("#user-message").addClass("green-text");
        if(userSession.numCorrect/userSession.questions.length === 1)
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
    for (var i = 0; i < userSession.questions.length; i++) {
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
    var imageLine = '<div class="col-sm-3"><i class="ion-close-round red-text symbol"></i></div>';

    if(userSession.correct[index]){
        imageLine = '<div class="col-sm-3"><i class="ion-checkmark-round green-text symbol"></i></div>'
    }

    //Div generation
    ///A push command for every line
    answerDiv.push(
        ///Whole box styling
        '<div class="question-box" id="question-box' + index + '">',
            ///Header bar - controls collapse section and is always shown
            '<div class="row header-bar" id="header-bar' + index + '" data-toggle="collapse" data-target="#answer-bar' + index + '" aria-expanded="false" aria-controls="answer-bar' + index + '">',
                ///Question number
                '<div class="col-sm-3 question-number">' + (index + 1) + '</div>',
                ///Question id
                '<div class="col-sm-3 id="question-id">' + userSession.indexes[index] + '</div>',
                imageLine,
                ///Both the up and down arrows - correct arrow for the current state is shown by CSS styling
                '<div class="col-sm-3"><i class="ion-android-arrow-dropdown-circle symbol"></i><i class="ion-android-arrow-dropup-circle symbol"></i></div>',
            '</div>',
            ///Collapsed section
            '<div class="answer-bar collapse" id="answer-bar' + index + '">',
                '<div class="row">',
                    '<div class="col-xs-12">',
                        ///The question text
                        '<div class="question-text" id="question-text' + index + '">' + userSession.questions[index] + '</div>',
                    '</div>',
                '</div>',
                '<div class="marked-answers">',
                    '<div class="row">',
                        '<div class="col-xs-12">',
                            ///User answer(s)
                            '<p>You answered:</p>',
                            '<input class="form-control" id="user-answer' + index + '" type="text" readonly value="' + userSession.userAnswers[index] + '"></input>',
                        '</div>',
                    '</div>',
                    '<div class="row">',
                        '<div class="col-xs-12">',
                            ///Correct answer(s)
                            '<p>Correct answer(s):</p>',
                            '<input class="form-control" id="marked-answer' + index + '" type="text" readonly value="' + userSession.correctAnswers[index] + '"></input>',
                        '</div>',
                    '</div>',
                '</div>', 
            '</div>',
        '</div>'
    );

    ///Combines every element of the array into one string and returns it
    return answerDiv.join("");
}

async function loadQualification() {
    var qualifications = [];
    userSession.filePath = $("#qualification").val() + "/";
    var api = apiRoot + "/filters";

    qualifications = await getAPIGetResult(api);

    $("#qualification").empty();

    qualifications.filters.qualifications.forEach(element => {
        $("#qualification").append(newSelectItem(element.q));
    });

    newQualification();
}

async function newQualification() {
    var examBoards = [];
    userSession.filePath = encodeURIComponent($("#qualification").val()) + "/";
    var api = filterAPI(userSession.filePath, false);

    examBoards = await getAPIGetResult(api);

    $("#examBoard").empty();
    $("#subject").empty();
    $("#topic-select").empty();

    examBoards.filters.examBoards.forEach(element => {
        $("#examBoard").append(newSelectItem(element.e));
    });

    newExamBoard();
}

async function newExamBoard() {
    var subjects = [];
    userSession.filePath = encodeURIComponent($("#qualification").val()) + "/" + encodeURIComponent($("#examBoard").val()) + "/";
    var api = filterAPI(userSession.filePath, false);

    subjects = await getAPIGetResult(api);

    $("#subject").empty();
    $("#topic-select").empty();

    subjects.filters.subjects.forEach(element => {
        $("#subject").append(newSelectItem(element.s));
    });

    newSubject();
}

async function newSubject() {
    var topics = [];
    userSession.filePath = encodeURIComponent($("#qualification").val()) + "/" + encodeURIComponent($("#examBoard").val()) + "/" + encodeURIComponent($("#subject").val()) + "/";
    var api = filterAPI(userSession.filePath, true);

    topics = await getAPIGetResult(api);



    userSession.topics = topics.filters;

    console.log(userSession.topics);

    loadTopics();
}

function loadTopics() {
    var topicSelector = [];

    userSession.topics.sections.forEach(section => {
        "<div class='topic-section'>"
        topicSelector.push(newThemeBox(section.s, "sections", false));

        userSession.topics[section.s].forEach((topic, i) => {
            topicSelector.push(newThemeBox(topic.t, section.s, true));
        });

        topicSelector.push("</div>");
    });

    $("#topic-select").empty();
    $("#topic-select").append(topicSelector.join(""));

    selectAll("sections");
}

function filterAPI(filePath, topics) {
    var uri = "";
    uri = apiRoot + "/filters?filePath=" + filePath;

    if(topics) {
        uri += "&topics=true";
    }

    return uri;
}

function newSelectItem(text) {
    var option = "<option value='" + text + "'>" + text + "</option>";
    return option
}

function textToCSS(text){
    var output = text;

    output = output.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"");
    output = output.replaceAll(" ", "-");
    output = output.toLowerCase();
    //console.log(output);

    return output;
}

function newThemeBox(name, section, isChild) {
    var checkBox = "";
    var boxClass = textToCSS(section);
    var boxID = textToCSS(name);

    checkBox = '<input type="checkbox" class="' + boxClass;

    if(isChild){
        checkBox += ' child-box';
    }

    checkBox += ' check-box" onchange="massSelect(\'' + boxID + '\',\'' + boxClass + '\')" value="' + name + '" id="' + boxID + '"/>';
    checkBox += '<label class="check-box-label" for="' + boxID + '">' + name + '</label><br/>'

    return checkBox;
}

function selectAll(boxID){
    var isSelected = $("#" + boxID).prop("checked");

    $(".topic-select input[type='checkbox']").prop('checked', isSelected);

    userSession.numTopics = 0;

    if(isSelected){
        userSession.topics.sections.forEach(section => {
            userSession.numTopics += userSession.topics[section.s].length;
        });
    }

    updateNumChecked();
}

function massSelect(boxID, boxClass) {
    var isSelected = $("#" + boxID).prop("checked");
    var isChanged = false;

    userSession.topics.sections.forEach(section => {
        var tempSection = textToCSS(section.s);

        if(tempSection === boxID) {
            if(isSelected) {
                $("." + boxID).each(function(index, element) {
                    if(!$(element).prop('checked')){
                        userSession.numTopics++;
                    }
                });
            } else {
                userSession.numTopics -= userSession.topics[section.s].length;
            }

            isChanged = true;
        }
    });

    if(!isChanged)
    {
        if(isSelected) {
            userSession.numTopics++;
        } else {
            userSession.numTopics--;
        }
    }

    $("." + boxID).prop('checked', isSelected);

    updateMassSelectors(isSelected, boxClass);
    updateNumChecked();
}

function updateNumChecked() {
    if(userSession.numTopics === 0) {
        $("#num-topics-selected").text("Please select one or more topic");
        $(".btn-questions").attr("disabled", "disabled");
    } else {
        $("#num-topics-selected").text(userSession.numTopics + " selected");
        $(".btn-questions").removeAttr("disabled");
    }
}

function updateMassSelectors(isSelected, boxClass){
    var isAllSelected = true;

    if(isSelected) {
        $("." + boxClass).each(function(index, element) {
            if(!$(element).prop('checked')){
                isAllSelected = false;
            }
        });

        $("#" + boxClass).prop('checked', isAllSelected);

        if(boxClass != "sections")
        {
            updateMassSelectors(true, "sections");
        }
    } else {
        $("#" + boxClass).prop('checked', false);
        $("#sections").prop('checked', false);
    }
}

window.onload = setTimeout(() => loadQualification(), 0);