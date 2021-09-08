//Generates a bar at the top of the screen to show the user what has gone wrong and an explanation
///text: the error message that is to be displayed
function generateErrorBar(text) {
    //Variables
    ///An array to store the error bar construct
    var errorBar = [];

    //HTML
    ///Pushes a row, a column and a label to the error bar. Each with the respective style classes and the inputted text in the label
    errorBar.push(
        "<div class='row error-row'>",
            "<div class='col-xs-12 error-col'>",
                "<label class='error-label'>" + text + "</label>",
            "</div>",
        "</div>",
    );

    ///Appends the error bar to the correct container at the top of the page
    $("#error-container").append(errorBar.join(""));

    hideLoader(true);
}

//Clears any error bars that may be on screen
function clearStatusBar () {
    //Empties the error bar container
    $("#error-container").empty();

    //Empties the success bar container
    $("#success-container").empty();
}

//Generates a bar at the top of the screen to show the user what has gone right
///text: the success message that is to be displayed
function generateSuccessBar(text) {
    //Variables
    ///An array to store the success bar construct
    var errorBar = [];

    //HTML
    ///Pushes a row, a column and a label to the success bar. Each with the respective style classes and the inputted text in the label
    errorBar.push(
        "<div class='row success-row'>",
            "<div class='col-xs-12 success-col'>",
                "<label class='success-label'>" + text + "</label>",
            "</div>",
        "</div>",
    );

    ///Appends the success bar to the correct container at the top of the page
    $("#success-container").append(errorBar.join(""));

    hideLoader();
}