import userModel from "../mongodb/models/users.js";
import User from "../mongodb/models/users.js";
const getAllUser=async(req,res)=>{
   try {
        const users=await User.find({}).limit(req.query._end);
        // console.log("ari")
        res.status(200).json(users)
   } catch (error) {
        res.status(500).json({message:error.message})
   }
};
const createUser=async(req,res)=>{
    // res.send({message:'Ok done'})
   
    try {
        const { name, email, avatar } = req.body;
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(200).json(userExists);
        const newUser = await User.create({
            name,
            email,
            avatar
        })
        res.status(200).json(newUser)
    } catch (error) {
        res.status(500).json({message:error.message})
    }
   
};
const getUserInfoByID=async(req,res)=>{
    try {
        
        const { id } = req.params;
        const user = await User.findOne({ _id: id }).populate('allProperties')
        if (user) res.status(200).json(user);
        else res.status(404).json("User Not Found") 
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
    
};

export{
    getAllUser,
    createUser,
    getUserInfoByID,
};