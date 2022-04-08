const http = require('http');
const MongoClient = require('mongodb').MongoClient;
const fs = require('fs');
const path = require('path')
var formidable = require('formidable');

http.createServer(function(req, res) {
    if (req.url == '/upload' && req.method.toLowerCase() == 'post') {
       const form  = formidable();
       form.parse(req,async(err,fields,files) => {
           console.log(files)
           console.log(files.upload.originalFilename)
           console.log(files.upload.filepath)
           if(err){
               res.writeHead(400)
               res.end({
                   status:'Failure',
                   msg:"Some error occured" + err.message
               })
           }
           let oldPath = files.upload.filepath;
           let newPath = `./images/${files.upload.originalFilename}`;
           fs.rename(oldPath,newPath,(err) => {
               if(err){
                   res.writeHead(400)
                   return res.end({
                       status:'Failure',
                       msg : "failed to upload file" + err.message
                   })
               }
               res.writeHead(201)
               return res.end('Successfully uploaded')
           })
           let body = [];
           body.push(fields)
           let path = {
               url : newPath
           }
           body.push(path)
           console.log(body)
                //mongodb connection  
        MongoClient.connect(url,function(err,db){
        if(err) throw err;
        var dbo = db.db('mydb');
        var data = {
          image : files,
          field :fields
        }     
          //define collection
        var User =  dbo.collection('user')
          //function to validate the data and files
        var fieldValidation = [
          dataValidation(first_name,last_name,age),
          imagevalidation(imageType),
          emailformatvalidation(email),
        ]
  
        const newUser = User.find({"field.email":email })
        newUser.toArray(function(err,result){
          console.log(result[0]);       
          if(result[0]){
            const message = 'User with emailid already exits'
            res.writeHead(401);  
            return res.end(JSON.stringify({'message': message}, null, 2));    
          }
          else{
            if(fieldValidation[0] === true && fieldValidation[1] === true && fieldValidation[2] === true){    
              User.insertOne(data,
              function(err,result){
              if(err) throw err;          
               })                    
                 
              const message = 'User Data collected'
              res.writeHead(200);  
              return res.end(JSON.stringify({'message': message}, null, 2));    
            }
            else{
                  //sending validation error
              var message = []
              for(i=0;i<fieldValidation.length;i++){        
                if(typeof fieldValidation[i] === 'string'){
                  message.push(fieldValidation[i])                                      
                }
              }    
              console.log(message)
              res.writeHead(400);    
              res.write(JSON.stringify(message))      
              return res.end();
              }   
            }
          })          
        }); 
       })
    }else{
         // show a file upload form
    res.writeHead(200, {'content-type': 'text/html'});
    res.end(
      '<form action="/upload" enctype="multipart/form-data" method="post">'+
      '<input type="text" name="title"><br>'+
      '<input type="file" name="upload" multiple="multiple"><br>'+
      '<input type="submit" value="Upload">'+
      '</form>'
    );
    } 
  }).listen(8080);
