//Get a page of notifications for the notification list portion of the page
///offset: how many items have been on previous pages
async function getNotificationPage(offset) {
    try {
        //Get User Page
        ///Clear the current notification page
        $("#frm-notification-page").empty();

        ///Get the page size from the select box
        var pageSize = $("#frm-notification-page-num").val();

        ///Set the offset to the user session object
        userSession.pageOffset = offset;

        ///The URI for the API to get a notification page, complete with query string parameters
        var api = apiRoot + "/notification/read-page?email=" + userSession.auth.email + "&offset=" + offset + "&amount=" + pageSize;

        ///The API call to get the notification page
        var data = await callGetAPI(api, "user data");

        userSession.numOfNotifications = data.count;

        if(userSession.numOfNotifications > 0) {
            $("#view-notifications-container").show();

            data = data.notifications;

            //Displaying Notification Page
            ///For each notification in the page
            data.forEach((element, index) => {
                ///Add their data to an object - converting it into a form that the function can handle
                var notification = {};
                notification.ID = element[0].longValue;
                notification.type = element[1].stringValue;
                notification.featureID = element[2].longValue;
                notification.info = element[3].stringValue;

                ///Append a notification row containing their information to the notification page
                $("#frm-notification-page").append(generateNotificationRow(notification, index));
            });

            ///Generate the page markers to go on the bottom of the notification page
            generatePageMarkers(userSession.numOfNotifications, offset/pageSize);

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
        } else {
            $("#view-notifications-container").hide();
            generateUpdateBar("You have no outstanding notifications");
        }

    } catch (e) {
        generateErrorBar(e);
    }
}

//Generate a notification row for the user page
///notification: the data of the notification to be displayed on the row
///index: the number of the notification on the page
function generateNotificationRow(notification, index) {
    //Generate Notification Row
    ///Array to store each line of the row - concatenated and returned at the end of the function
    var notificationRow = [];

    var linkRow = '';

    if(notification.type === "comment") {
        var comment = notification.info.match(/"[\w\W]+"/)[0];
        comment = comment.substring(1, (comment.length - 1))
        linkRow = '<button type="button" class="btn btn-goto" onclick="notificationAction(\'' + notification.type + '\', ' + notification.featureID + ', \'' + comment + '\')"><i class="ion-link"></i></button>';
    } else if(notification.type != "ass_delete" || notification.type != "ass_complete") {
        linkRow = '<button type="button" class="btn btn-goto" onclick="notificationAction(\'' + notification.type + '\', ' + notification.featureID + ')"><i class="ion-link"></i></button>';
    }

    ///Push the delete row to the array
    notificationRow.push(
        '<div class="row notification-row" id="notification-row-' + index + '">',
            '<div class="col-xs-1">',
                linkRow,
            '</div>',
            ///Contains a user's first name, last name, email, date of birth and access level
            '<div class="col-xs-10" id="notification-info-' + index + '">' + notification.info + '</div>',
            ///Also contains a button that allows the viewer to delete this user
            '<div class="col-xs-1">',
                '<button type="button" class="btn btn-delete" onclick="markRead(' + notification.ID + ')"><i class="ion-close-round"></i></button>',
            '</div>',
        '</div>'
    );

    return notificationRow.join("");
}

//Changes the notification page by + or - 1
///Change: how many pages to change by
function newNotificationPage(change) {
    //Variables
    ///The number of notifications on a page, determined by a select box
    var pageSize = $("#frm-notification-page-num").val();

    ///How many notifications to change by
    var changeBy = pageSize * change;

    ///How many notifications are now in previous pages
    var offset = userSession.pageOffset + changeBy;


    //Change page
    ///If the new offset is a valid number
    if(offset >= 0 || offset <= userSession.numOfNotifications){
        ///Change the notification page
        getNotificationPage(offset);    
    }
}

//Sets the notification page to a new page
///pageNumber: the number of the page you are now changing to
function setNotificationPage(pageNumber) {
    //Variables
    ///The number of notifications on a page, determined by a select box
    var pageSize = $("#frm-notification-page-num").val();

    ///The number of notifications now on previous pages
    var offset = pageSize * pageNumber;

    //Change Page
    ///If the new offset is a valid number
    if(offset >= 0 || offset <= userSession.numOfNotifications){
        ///Change the notifications page
        getNotificationPage(offset);    
    }
}

//Generates the page markers that go underneath the notification page
///numOfItems: how many notifications there are for the current school
///currentPage: which page is currently selected
function generatePageMarkers (numOfItems, currentPage) {
    //Generate Page Markers
    ///Empty out the current page marker row
    $("#page-markers").empty();

    ///The number of notifications on a page, determined by a select box
    var pageSize = $("#frm-notification-page-num").val();

    ///How many markers to generate - truncated by parse int so one is added if there are extraneous notifications
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

//Mark a notification as read
///notificationID: the ID of the notification that is being marked as read
async function markRead(notificationID) {
    try {
        clearStatusBar();

        //Mark Read
        ///The URI of the API to call to mark the notification as read, with the notification ID as a parameter
        var api = apiRoot + "/notification/mark-read?notificationID=" + notificationID;
        
        ///Calling the API
        await callGetAPI(api, "notification", true);

        ///Refreshing the notification page to reflect the change
        getNotificationPage(0);

        generateSuccessBar("Notification successfully read");
    } catch (e) {
        generateErrorBar(e);
    }
}

//Performs a relevant action for a notification, depending on type of notification
///type: the type of notification
///featureID: the ID of the linked feature
///comment: the comment of the notification
function notificationAction(type, featureID, comment) {
    //Action
    ///Switching on notification type - stores attributes in session storage then changes to the relevant page
    switch (type) {
        case "flag":
            sessionStorage.setItem("historyID", featureID);
            window.location.replace(baseURL + "question-history");
            break;

        case "comment":
            sessionStorage.setItem("comment", comment);
            sessionStorage.setItem("historyID", featureID);
            window.location.replace(baseURL + "question-history");
            break;

        case "ass_create":
            sessionStorage.setItem("assignmentID", featureID);
            window.location.replace(baseURL + "view-assignments");
            break;

        case "ass_edit":
            sessionStorage.setItem("assignmentID", featureID);
            window.location.replace(baseURL + "view-assignments");
            break;        
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
    getNotificationPage(0);
}
