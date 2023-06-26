import  express  from "express";
import { createUser,getAllUser,getUserInfoByID } from "../controllers/user.controller.js";
const router=express.Router();
router.route('/').get(getAllUser);
router.route('/').post(createUser);
router.route('/:id').get(getUserInfoByID);
export default router;