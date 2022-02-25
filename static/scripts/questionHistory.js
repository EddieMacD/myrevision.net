//Gets an instance of question history for a specific ID
///questionID: 
async function getHistory(historyID) {
    try {
        clearStatusBar();

        //Get History
        ///The URI for the API to get the history, complete with the historyID
        var api = apiRoot + "/question/history/recall?historyID=" + historyID;

        ///The question history data is retrieved from the back-end
        var data = await callGetAPI(api, "user data");

        ///The question history data is put into the userSession object 
        userSession.questionData = data.questionData.question;
        userSession.timeSpent = data.historyData.timeSpent;
        userSession.userAnswers = data.historyData.userAnswer;
        userSession.correctAnswers = extractAnswers(data.questionData.answer)

        ///The answer is marked
        markAnswer();

        ///The history is shown to the user
        $("#answer-container").append(buildHistoryDiv(data.fileData));
    } catch (e) {
        generateErrorBar(e);
    }
}

//Marks a single answer
function markAnswer () {
    //Mark answer
    ///If no answer was given then do nothing
    if(userSession.userAnswers.length != 0)
    {
        ///Set a boolean flag variable to true - represents whether the user has gotten the whole question correct. Defaults to correct
        var allCorrect = true;

        ///Depending on the type of question
        switch(userSession.questionData.type)
        {
            case "boxMatch":
                ///For each answer
                for(var j = 0; j < userSession.userAnswers.length; j++)
                {
                    ///If the correct answers don't contain the user answer 
                    ///Standard for string match questions
                    if(userSession.correctAnswers[j] != userSession.userAnswers[j]) {
                        ///The user got the question wrong
                        allCorrect = false;
                    }
                }
                break;
        
            case "multipleChoice":
                if(userSession.userAnswers.length === userSession.correctAnswers.length)
                {
                    ///For each user answer
                    for(var j = 0; j < userSession.userAnswers.length; j++)
                    {
                        ///If the correct answers doesnt contain the user answer
                        ///Multiple choice is segregated due to the lack of case sensitivity errors. Answers are stored the same as the question prompts are displayed
                        if(!userSession.correctAnswers.includes(userSession.userAnswers[j])) {
                            ///The user got the question wrong
                            allCorrect = false;
                        }
                    }      
                } else {
                    allCorrect = false;
                }
                break; 

            default:
                ///For each answer
                for(var j = 0; j < userSession.userAnswers.length; j++)
                {
                    ///If the correct answers don't contain the user answer 
                    ///Standard for string match questions
                    if(!userSession.correctAnswers.includes(userSession.userAnswers[j].toLowerCase())) {
                        ///The user got the question wrong
                        allCorrect = false;
                    }
                }
                break;
        }

        ///If the user got the question completely correct
        if(allCorrect) {
            ///Update the user session to show that this question is correct
            userSession.isCorrect = true;
        }
    }
}

//Generates an answer block for a given question
function buildHistoryDiv(fileData) {
    //Variables
    ///A string array for each line of the box. To be combined then returned at the end of the function.
    var answerDiv = [];

    ///The icon inside the header bar - standard is red cross
    var icon = 'ion-close-round red-text symbol';

    var commentBox = [];

    //Variable selection
    ///If the user got the question correct
    if(userSession.isCorrect){
        ///Set the icon to the green tick
        icon = 'ion-checkmark-round green-text symbol'
    }

    ///If the user commented on the question then show the comment
    if(sessionStorage.getItem("comment")) {
        commentBox.push(
            '<div class="row comment-container">',
                '<div class="col-xs-12 comment-row">',
                    '<input type="text" disabled="disabled" value="' + sessionStorage.getItem("comment") + '" class="comment-box form-control">',
                '</div>',
            '</div>'
        );

        commentBox = commentBox.join("");
    }

    //Div generation
    ///A push command for every line
    answerDiv.push(
        ///Whole box styling
        '<div class="question-box" id="question-box">',
            ///Header bar - controls collapse section and is always shown
            '<div class="row header-bar" id="header-bar">',
                ///Question number
                '<div class="col-xs-1 question-number"></div>',
                ///Question id - converts question id into a subject specific format
                '<div class="col-xs-2 question-id">' + convertQuestionIndex(fileData) + '</div>',
                '<div class="col-xs-5 question-time">' + timerToText(userSession.timeSpent) + '</div>',
                '<div class="col-xs-2"><i class="' + icon + '"></i></div>',
                ///Both the up and down arrows - correct arrow for the current state is shown by CSS styling
                '<div class="col-xs-2"></div>',
            '</div>',
            ///Collapsed section
            '<div class="answer-bar" id="answer-bar">',
                '<div class="row">',
                    '<div class="col-xs-12">',
                        ///The question text                  
                        '<div class="question-text" id="question-text">' + userSession.questionData.text[0].q + '</div>',
                    '</div>',
                '</div>',
                '<div class="marked-answers">',
                    '<div class="row">',
                        '<div class="col-xs-12">',
                            ///User answer(s)
                            '<p>They answered:</p>',
                            ///Determined by a function, depending on the type of question
                            displayAnswerText(userSession.userAnswers, "user-answer"),
                        '</div>',
                    '</div>',
                    '<div class="row">',
                        '<div class="col-xs-12">',
                            ///Correct answer(s)
                            '<p>Correct answer(s):</p>',
                            displayAnswerText(userSession.correctAnswers, "marked-answer"),
                        '</div>',
                    '</div>',
                '</div>', 
            '</div>',
            commentBox,
        '</div>'
    );

    ///Combines every element of the array into one string and returns it
    return answerDiv.join("");
}

//Converts a number of milliseconds into a user-friendly string
///input: the number (in milliseconds) to be converted
function timerToText(input) {
    //Variables
    ///The number of milliseconds to be converted
    var timer = input;

    ///The string to be returned at the end of the function
    var output = "";

    //Display handling
    ///If the timer contains hours
    if(timer % 3600000 != timer){
        ///Add an integer number of hours to the string
        output += Math.floor(timer / 3600000) + "h ";

        ///Remove thr hours from the timer
        timer = timer % 3600000;
    }

    ///If the timer contains minutes
    if(timer % 60000 != timer){
        ///Add an integer number of minutes to the string
        output += Math.floor(timer / 60000) + "m ";

        ///Remove thr hours from the timer
        timer = timer % 60000;
    }

    ///Add an integer number of seconds to the string
    output += Math.floor(timer / 1000) + "s ";

    return output;
}

//Converts a generic file name into a subject specific file name - puts three letters in the front for the corresponding file path elements
function convertQuestionIndex(fileData) {
    //Variables
    ///The output, returned at the end of the function, stores the file index
    var fileIndex = "";

    ///The location of the files in the object store - stores locally to allow manipulation 
    var filePath = fileData.filePath;


    //Index conversion
    ///For each filter
    for(var i = 0; i < 3; i++)
    {
        ///Add the first character of the file path to the index
        fileIndex += filePath[0];

        ///Removes the front element of the file path and the corresponding slash
        filePath = filePath.substring(filePath.indexOf("/") + 1);
    }

    ///Add the file name to the index
    fileIndex += fileData.fileName;

    return fileIndex;
}

//Extracts the answers from the retrieve question history
///answer: the data from the file
function extractAnswers(answer) {
    //Extract answers
    ///Array for the answers to be put in
    var answerSet = [];

    ///For each answer in the array
    answer.forEach((element) => {
        ///Push the text to the answer set
        answerSet.push(element.a);
    });

    return answerSet;
}

//Choose the correct function to display the answer for either the correct answers or the user answers for the answer screen
///answerSet: the set of texts to be displayed either the correct answers or the user answers
///idStem: the base of the answer box ids
function displayAnswerText(answerSet, idStem) {
    //Variable
    ///The output of the function, returned at the end
    var output = "";


    //Display answer
    ///Depending on the type of question load an answer set in the correct format for the answer screen
    switch (userSession.questionData.type){
        case "multipleChoice":
            output = displayMultipleChoice(answerSet, idStem);
            break;

        case "boxMatch":
            output = displayBoxMatch(answerSet, idStem);
            break;

        default:
            output = displayBasicQuestion(answerSet, idStem);
            break;
    }

    return output;
}

//Displays a multiple choice answer set for the answer screen
///answerSet: the set of texts to be displayed either the correct answers or the user answers
///idStem: the base of the answer box ids
function displayMultipleChoice(answerSet, idStem) {
    //Variables
    ///An array to store all of the HTMl for the display - returned from the function as a joined string
    var multChoice = [];

    //Generate display
    ///For each question prompt
    for(var i = 1; i < userSession.questionData.text.length; i++)
    {
        ///Set a temporary variable containing the prompt
        var tempText = userSession.questionData.text[i].q;

        ///Push the beginning of a check box to the display
        multChoice.push('<input type="checkbox" class="multiple-choice-box check-box"');

        ///If the prompt is in the answer set
        if(answerSet.includes(tempText))
        {
            ///Check the box
            multChoice.push(' checked="true" ');
        }

        ///Finish the check box, including the disabled attribute 
        multChoice.push('value="' + tempText + '" id="' + idStem + '.' + (i - 1) + '"disabled/>');

        ///Add a label to the check box
        multChoice.push('<label class="answer-box-label" for="' + idStem + '.' + (i - 1) + '">' + tempText + '</label><br/>');
    }

    return multChoice.join("");
}

//Displays a box match answer set for the answer screen
///answerSet: the set of texts to be displayed either the correct answers or the user answers
///idStem: the base of the answer box ids
function displayBoxMatch(answerSet, idStem) {
    //Variables
    ///An array to store all of the HTMl for the display - returned from the function as a joined string
    var boxMatch = [];

    ///The number of rows that need to be generated for the box match
    var loopLength = (userSession.questionData.text.length - 1)/2;


    //Generate display
    ///Open the row and then the column for the static prompts
    boxMatch.push(
        '<div class="row">',
        '<div class="col-xs-6">'
    );

    ///Display the static prompts
    for(var i = 1; i < loopLength + 1; i++)
    {
        boxMatch.push('<label class="drag-label">' + userSession.questionData.text[(2 * i - 1)].q + '</label><br/>');
    }

    ///Close the static prompt list and and open the dynamic list (disabled now)
    boxMatch.push(
        '</div>',
        '<div class="col-xs-6">',
    );

    ///Display the disabled dynamic prompts
    for(var i = 0; i < loopLength; i++)
    {
        boxMatch.push('<div class="drag-label"><label id="' + idStem + "." + i + '">' + answerSet[i] + '</label></div>');
    }

    ///Close any remaining divs
    boxMatch.push(
        '</div>',
        '</div>'
    );

    return boxMatch.join("");
}

//Displays a string match / standard answer set for the answer screen
///answerSet: the set of texts to be displayed either the correct answers or the user answers
///idStem: the base of the answer box ids
function displayBasicQuestion(answerSet, idStem) {
    //Variables
    ///An array to store all of the HTMl for the display - returned from the function as a joined string
    var answerBox = [];

    //Generate display
    ///For each question prompt
    for(var i = 0; i < answerSet.length; i++){
        ///Push an answer box with an answer from the answer set
        answerBox.push('<input class="form-control" id="' + idStem + "." + i + '" type="text" readonly value="' + answerSet[i] + '"></input>');
    }

    return answerBox.join("");
}

//Runs when the code loads - the timeout buffers until the full page loads
///Runs the initialise function in case more than one function call is needed
window.onload = function(){
    setTimeout(initialise(), 1);
};
 
//Runs when the page loads
async function initialise(){
    //Set the loader to 1 (on by default)
    userSession.loaderVal = 1;

    //Function calls
    ///Initialise the user
    initialiseAuth(); 

    ///If there is question history in the session storage
    if(sessionStorage.getItem("historyID"))
    {
        ///Get the ID from the session storage and remove it from the session storage
        var historyID = sessionStorage.getItem("historyID");
        sessionStorage.removeItem("historyID");

        ///Get the history for that ID
        getHistory(historyID);
    } else {
        window.location.replace(baseURL + loginLocation);
    }
 }