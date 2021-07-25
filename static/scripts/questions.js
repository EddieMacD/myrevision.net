const apiRoot = "https://r8d4v61idi.execute-api.eu-west-2.amazonaws.com/live";
var userSession = {};

async function startQuestions(){
    var numOfQuestions = $("#numberOfQuestions").val();
    userSession.filePath = "iGCSE/CIE/Computer%20Science/";
    var api = compileQuestionAPI(numOfQuestions);
    //var results = await getAPIResult(api);
    var results = {"questions":["What is a user defined data structure to store multiple pieces of data?","What types of construct ask a computer to complete an instruction multiple times?","What type of subroutine returns an output?","Which datatype functions as a collection of symbols?","Which datatype stores whole numbers?"],"indexes":["0021","0011","0008","0015","0019"]};


    userSession.questions = results.questions;
    userSession.indexes = results.indexes;
    userSession.userAnswers = new Array(numOfQuestions).fill("");

    displayQuestionScreen();
}

function compileQuestionAPI(numOfQuestions) {
    var url = "";
    
    url = apiRoot + "/questions?filePath=" + userSession.filePath + "&numOfQuestions=" + numOfQuestions;
    console.log(url);

    return url;
}

async function getAPIResult(api) {
    return new Promise((resolve, reject) => {
        $.get(api, html => {
            resolve(html)
        });
    });
}

function displayQuestionScreen() {  
    $("#frm-filter").hide();
    $("#frm-questions").show();

    for(var i = 0; i < userSession.questions.length; i++) {
        $("#question-bar").append("<div class='question-block' id='question-block" + i + "' onclick='displayQuestion(" + i + ")'>" + (i + 1) + "</div>");
    }

    displayQuestion(0);
}

function displayQuestion(index) {
    $("#question-title").text("Question " + (index + 1));
    $("#question-text").text(userSession.questions[index]);
    $(".question-block").removeClass("selected-block");
    $("#question-block" + index).addClass("selected-block")

    userSession.userAnswers[userSession.currentQuestion] = $("#answer-box").val();
    $("#answer-box").val(userSession.userAnswers[index]);

    userSession.currentQuestion = index;

    $(".btn-prev").removeAttr("disabled");
    $(".btn-next").removeAttr("disabled");
    $(".ans-button").hide();


    if(index == 0) {
        $(".btn-prev").attr("disabled", "disabled");
    } else if (index === userSession.questions.length - 1) {
        $(".btn-next").attr("disabled", "disabled");
        $(".ans-button").show();
    }

    $("#answer-box").focus();
}

function selectPrevQuestion() {
    var index = userSession.currentQuestion;

    if(index > 0) {
        displayQuestion(index - 1);
    }
}

function selectNextQuestion() {
    var index = userSession.currentQuestion;

    if(index < userSession.questions.length - 1) {
        displayQuestion(index + 1);
    }
}

async function submitAnswers() {
    userSession.userAnswers[userSession.currentQuestion] = $("#answer-box").val();

    //userSession.correctAnswers = [ "a", "concatenation", "b", "c", "d"]
    //userSession.correct = [false, true, true, false, false];
    var api = compileAnswerAPI();
    var response = await getAPIResult(api);

    userSession.correctAnswers = response.answers;
    markAnswers();

    displayAnswerScreen();
}

function compileAnswerAPI() {
    var url = "";
    
    url = apiRoot + "/answers?filePath=" + userSession.filePath;

    for (var i = 0; i < userSession.questions.length; i++) {
        url += "&indexes=" + userSession.indexes[i];
    }

    console.log(url);

    return url;
}

function markAnswers() {
    userSession.correct = new Array(5).fill(false);
    userSession.numCorrect = 0;

    for (var i = 0; i < userSession.questions.length; i++) {
        if(userSession.userAnswers[i] === userSession.correctAnswers[i]) {
            userSession.correct[i] = true;
            userSession.numCorrect++;
        }
    }
}

function displayAnswerScreen() {
    const lowScore = 0.33;
    const mediumScore = 0.66;

    $("#frm-questions").hide();
    $("#frm-answers").show();

    $("#user-score-value").text(userSession.numCorrect);
    $("#total-score-value").text(userSession.questions.length);

    if(userSession.numCorrect/userSession.questions.length <= lowScore) {
        $("#user-score-value").addClass("red-text");
        $("#user-message").addClass("red-text");
        $("#user-message").text("Good Effort!");
    } else if(userSession.numCorrect/userSession.questions.length <= mediumScore) {
        $("#user-score-value").addClass("amber-text");
        $("#user-message").addClass("amber-text");
        $("#user-message").text("Good Results!");
    } else {
        $("#user-score-value").addClass("green-text");
        $("#user-message").addClass("green-text");
        if(userSession.numCorrect/userSession.questions.length === 1)
        {        
            $("#user-message").text("Brilliant!");
        } else {
            $("#user-message").text("Well Done!");
        }
    }

    for (var i = 0; i < userSession.questions.length; i++) {
        $("#answer-container").append(buildAnswerDiv(i));
    }
}

function buildAnswerDiv(index) {
    var answerDiv = [];
    var imageLine = '<div class="col-sm-3"><i class="ion-close-round red-text symbol"></i></div>';

    if(userSession.correct[index]){
        imageLine = '<div class="col-sm-3"><i class="ion-checkmark-round green-text symbol"></i></div>'
    }

    answerDiv.push(
        '<div class="question-box" id="question-box' + index + '">',
        '<div class="row header-bar" id="header-bar' + index + '" data-toggle="collapse" data-target="#answer-bar' + index + '" aria-expanded="false" aria-controls="answer-bar' + index + '">',
        '<div class="col-sm-3 question-number">' + (index + 1) + '</div>',
        '<div class="col-sm-3 id="question-id">' + userSession.indexes[index] + '</div>',
        imageLine,
        '<div class="col-sm-3"><i class="ion-android-arrow-dropdown-circle symbol"></i><i class="ion-android-arrow-dropup-circle symbol"></i></div>',
        '</div>',
        '<div class="answer-bar collapse" id="answer-bar' + index + '">',
        '<div class="row">',
        '<div class="col-xs-12">',
        '<div class="question-text" id="question-text' + index + '">' + userSession.questions[index] + '</div>',
        '</div>',
        '</div>',
        '<div class="marked-answers">',
        '<div class="row">',
        '<div class="col-xs-12">',
        '<p>You answered:</p>',
        '<input class="form-control" id="user-answer' + index + '" type="text" readonly value="' + userSession.userAnswers[index] + '"></input>',
        '</div>',
        '</div>',
        '<div class="row">',
        '<div class="col-xs-12">',
        '<p>Correct answer(s):</p>',
        '<input class="form-control" id="marked-answer' + index + '" type="text" readonly value="' + userSession.correctAnswers[index] + '"></input>',
        '</div>',
        '</div>',
        '</div>',           
        '</div>',
        '</div>'
    );

    return answerDiv.join("");

}