function createFoldersAndFiles() {
  var sheetName = "Students Info"; //This is the name of the google sheet that is being reviewed.
  var mainFolderName = "Main Folder";
 //Note that main folder uses google drive api to store all individual folders
 

/* 
This retrieves data from the google sheet:
- By getting the active sheet that is being reviewed
- and retrieving the data from the sheet
*/
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = sheet.getDataRange().getValues(); 
  var headerRow = data.shift();


// Create the main folder
  var mainFolder = DriveApp.createFolder(mainFolderName);


// This variable wilb be used  to keep track of the subfolders that will be processed
  var currentSubfolder = null;
  

// Initalizing an object that will be used to define the styling attributes of the text
  var technicalReportStyle = {};
  technicalReportStyle[DocumentApp.Attribute.FONT_SIZE] = 12;
  technicalReportStyle[DocumentApp.Attribute.BOLD] = false; // Set the text as bold


/*
- This loop iterate through each row to access the data of the student
- Lines within the loop extract various details of the  student such as name, email, username and score.
- Line 42 gets answers of students starting from the 6th column
- This loop also create a folder of the students 
*/
  for (var i = 0; i < data.length; i++) {
    var studentName = data[i][0];
    var studentSurname= data[i][1];
    var emailAddress = data[i][2]; // this is to specify that email address is in the 3rd
    var score = data[i][3]; 
    var username = data[i][4]; 
    var studentAnswer = data[i].slice(5); // get answers for the student (excluding the name in the first column)
    

//  A new folder is created for each student inside the main folder.
    var studentFolder = mainFolder.createFolder(studentName);


// Create a new Google Document
    var doc = DocumentApp.create("Questions_and_Answers");
    var body = doc.getBody();


/*
Formatting the Google Docs document:
This part of code adds headings, spacing, and student details to the document.
It creates a table with "Technical Report" on the left side.
And the loop then iterates through each question and answer, appending them as paragraphs to the document.
*/
    var paragraph = body.appendParagraph("Formative Assessment Results");
    paragraph.setHeading(DocumentApp.ParagraphHeading.HEADING1);
    paragraph.setAttributes(technicalReportStyle);
    paragraph.setIndentStart(0); // Set left indentation 
  

    body.appendParagraph("").setSpacingAfter(15);

    var heading = body.insertParagraph(0, "Formative Assessment 6");
    heading.setHeading(DocumentApp.ParagraphHeading.HEADING1);
    heading.setAlignment(DocumentApp.HorizontalAlignment.CENTER);


// Add student details in the pdf
    body.appendParagraph("Student First Name: " + studentName);
    body.appendParagraph("Student Last Name: " + studentSurname);
    body.appendParagraph("Username: " + username);
    body.appendParagraph("Score: " + score);
    body.appendParagraph(""); // Add an empty line between student details and questions 

    body.appendParagraph("").setSpacingAfter(15); 

    var table = body.appendTable([["Technical Report"]]);
    table.getRow(0).getCell(0).getChild(0).asText().setAttributes(technicalReportStyle);

    body.appendParagraph("").setSpacingAfter(15); 

// Add student's emailAddress
    body.appendParagraph("The respondent's email: " + emailAddress);

    body.appendParagraph("").setSpacingAfter(15); 
 

/*
- This inner loop iterates through questions and answers of the student
- The lines within this inner loop extract questions and answers
- and append them as paragraphs to the body of the google document.
*/
    for (var j = 0; j < headerRow.length - 5; j++) {
      var question = headerRow[j + 5];
      var answer = studentAnswer[j];
      body.appendParagraph("Question: " + question);
      body.appendParagraph("Answer: " + answer);
      body.appendParagraph(""); // Add an empty line between each question and answer
    }
    body.appendParagraph("");


/*
- Get questions and answers for each student
- This line extracts the student's answers from the data array 
- and using slice(5) method to remove the first five elements that are not questions
- Append questions and corresponding answers to the pdf content
- then log and save changes to the google document
*/
    var studentQuestions = data[i].slice(5);
    var pdfContent = "Answers from : " + studentName + "\n\n";
 
    headerRow.slice(5).forEach(function(question,questionIndex){
      pdfContent += "Question: " + question + "\n";
      pdfContent += "Answers: " + studentQuestions[questionIndex ] + "\n\n";
    });

    Logger.log(pdfContent);
    doc.saveAndClose();


/*
The remaining part of code converts the google document containing the student's info to a PDF Blob
and also cleans up temporary file to avoid clusturing google drive with alot of
documents.This process is repeated with every students pdf
*/

    var pdfBlob = doc.getAs('application/pdf');
    var pdfFile = studentFolder.createFile(pdfBlob);

    DriveApp.getFileById(doc.getId()).setTrashed(true);
    
  }
}