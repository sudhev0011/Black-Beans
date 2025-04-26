const bcrypt =require('bcrypt')

const comparePass = async(newPass,oldPass)=>{

    try {
      const checkPass = await bcrypt.compare( newPass, oldPass);
      return checkPass;
    } catch (error) {
      if(error){
        return error;
      }
    }
  }

  module.exports=comparePass;