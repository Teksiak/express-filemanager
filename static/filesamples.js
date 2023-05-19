const fileSamples =  {
    txt: "This is your txt file.",
    html: `
        <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    <h1>This is your HTML page.</h1>
</body>
</html>`,
    css: `
    /* Applies to the entire body of the HTML document (except where overridden by more specific
        selectors). */
        body {
          margin: 25px;
          background-color: rgb(240,240,240);
          font-family: arial, sans-serif;
          font-size: 14px;
        }
        
        /* Applies to all <h1>...</h1> elements. */
        h1 {
          font-size: 35px;
          font-weight: normal;
          margin-top: 5px;
        }
        
        /* Applies to all elements with <... class="someclass"> specified. */
        .someclass { color: red; }
        
        /* Applies to the element with <... id="someid"> specified. */
        #someid { color: green; }
    `,
    js: "console.log('This is your js file');",
    json: `
    {
        "fruit": "Apple",
        "size": "Large",
        "color": "Red"
    }`,
    xml: `
    <note>
<to>You</to>
<from>Andrew</from>
<heading>Hello</heading>
<body>This is your xml file!</body>
</note>
    `,
};
