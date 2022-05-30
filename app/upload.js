const express = require('express');
const router = express.Router();
const Picture = require('./models/picture.js'); // get our mongoose model
const User = require('./models/user.js'); // get our mongoose model
const path_module = require('path');

router.post("/", async (req, res) => {
    if (!req.files) {
      return res.status(400).send("No files were uploaded.");
    }
  
    const file = req.files.myFile;
    path = __dirname + "/files/";
    
    const allowed_files_extensions = ['.png', '.jpeg', '.jpg', '.gif'];
    const allowed_file_types = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif'];
    let extension = path_module.extname(file.name);
    console.log(extension);
    if(!allowed_files_extensions.includes(extension) || !allowed_file_types.includes(file.mimetype)){
      console.log(allowed_files_extensions.includes(extension), allowed_file_types.includes(file.mimetype));  
      return res.status(415).send("Invalid file type provided");
    }

    console.log(file.name);
    let picture = new Picture({
        name: file.name,
        path: '',
        time: Date.now()
    });
    await picture.save();

    picture.path = picture._id + '.' + file.name.split('.').pop();    // Object ID in DB + extension of original file
    await picture.save();

    path += picture.path;
  
    let user = await User.findOne({_id: req.loggedUser.id});
    if (user){
        user.pictures.push(picture);
    }
    await user.save();


    file.mv(path, (err) => {
      if (err) {
        return res.status(500).send(err);
      }
      return res.send({ status: "success", path: path });
    });
});

module.exports = router;