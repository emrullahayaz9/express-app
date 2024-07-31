const express = require("express");
const controllers = require("../controller/controllers");

const router = express.Router();
router.get("/", controllers.MainPageController);

router.get("/ekle", controllers.AddUserGet);

router.post("/ekle", controllers.AddUserPost);

router.get("/guncelle/:id", controllers.UpdateUserGet);

router.post("/guncelle/:id", controllers.UpdateUserPost);

router.get("/sil/:id", controllers.DeleteUser);

router.get("/tum", (req, res) => {
  const users = controllers.users;
  res.render("tum", { users });
});

router.get("/login", controllers.LoginUserGet);

router.get("/register", controllers.RegisterUserGet);

router.post("/login", controllers.LoginUserPost);

router.post("/register", controllers.RegisterUserPost);

router.get("/welcome-admin", controllers.WelcomeAdminGet);

router.get("/welcome-user", controllers.WelcomeNormalUserGet);

router.get("/logout", controllers.LogoutUser);

module.exports = router;
