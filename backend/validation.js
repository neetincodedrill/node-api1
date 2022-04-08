function dataValidation(first_name,last_name,age){
    const value  = parseInt(age);
    if(typeof first_name != 'string'){
        return "first_name is in wrong format"
    }
    else if( typeof last_name != 'string'){
        return "last_name is in wrong format"
    }
    else  if(isNaN(value) === true){
        return 'Age is in wrong format'
    }
    else{
        return true
    }
}

function emailformatvalidation(email){
    var emailRegex = /^[-!#$%&'*+\/0-9=?A-Z^_a-z{|}~](\.?[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/;
    if(email.match(emailRegex)){
        return true;
    }else{
        return 'Email format is wrong'
    } 
}


function imagevalidation(imageType){
    if(imageType === 'image/png' || imageType === 'image/jpg'){
        return true
    }else{
        return 'Image consist of wrong extension'
    }
}


module.exports = { dataValidation,emailformatvalidation,imagevalidation}