const express = require('express');
const router = express.Router();
const Picture = require('./models/picture.js'); // get our mongoose model
const User = require('./models/user.js'); // get our mongoose model

router.post("/", async (req, res) => {
    if (!req.files) {
      return res.status(400).send("No files were uploaded.");
    }
  
    const file = req.files.myFile;
    const path = __dirname + "/files/" + file.name;
    let picture = new Picture({
        name: file.name,
        path: path
    });

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