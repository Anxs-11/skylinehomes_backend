import mongoose from "mongoose";
import Property from "../mongodb/models/property.js";
import User from "../mongodb/models/users.js";
import * as dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';

dotenv.config();
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})

const getAllProperties = async (req, res) => {
    const {_end,_order,_start,_sort,title_like="",propertyType=""}=req.query;
    const query={};
    if(propertyType!==''){
        query.propertyType=propertyType;
    }
    if(title_like){
        query.title={$regex:title_like,$options:'i'}
    }
    try {
        const count=await Property.countDocuments({query});
        const properties=await Property.find(query).limit(_end).skip(_start).sort({[_sort]:_order});
        res.header('x-total-count',count);
        res.header('Access-Control-Expose-Headers','x-total-count');
        res.status(200).json(properties);
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
};
const createProperty = async (req, res) => {
    try {
        const { title, description, propertyType, location, price, photo, email } = req.body;
        // console.log("ari")
        const session = await mongoose.startSession();
        session.startTransaction();
        const user = await User.findOne({ email }).session(session)
        if (!user) throw new Error('User Not Found');
        const photoData = photo.split(",")[1];
        
        const photoUrl = await cloudinary.uploader.upload(`data:image/jpeg;base64,${photoData}`);
        console.log(photoUrl.secure_url)
        const newProperty = await Property.create({
            title,
            description,
            propertyType,
            location,
            price,
            photo: photoUrl.secure_url,
            creater: user._id

        })
        user.allProperties.push(newProperty._id)
        await user.save({ session });
        await session.commitTransaction();
        res.status(200).json({ message: "Property created successfully" })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
};

const getPropertyDetail = async (req, res) => {
   
    const {id}=req.params;
    const propertyExists = await Property.findOne({ _id: id }).populate('creater').exec();
    // console.log(propertyExists.creater.allProperties)
    if (propertyExists) res.status(200).json({ propertyDetails: propertyExists, creater: propertyExists.creater, avatar: propertyExists.creater.avatar, email: propertyExists.creater.email, name: propertyExists.creater.name, allProperties: propertyExists.creater.allProperties})
    else res.status(404).json({message:'Property Not Found'})
 };
const updateProperty = async (req, res) => {
    console.log("coming request")
    try {
        const {id}=req.params;
        const { title, description, propertyType, location, price, photo } = req.body;
        const photoData = photo.split(",")[1];
        const photoUrl = await cloudinary.uploader.upload(`data:image/jpeg;base64,${photoData}`);
        await Property.findByIdAndUpdate({_id:id},{
            title,
            description,
            propertyType,
            location,
            price,
            photo: photoUrl.secure_url || photo,
            
        })
        res.status(200).json({ message: "Property Updated successfully" })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
 };
const deleteProperty = async (req, res) => { 
    try {
        const { id } = req.params;
        const propertyToDelete = await Property.findById({ _id: id }).populate('creater')
        if (!propertyToDelete) throw new Error('Property Not Found');
        const session = await mongoose.startSession();
        session.startTransaction();
        propertyToDelete.deleteOne({session});
        propertyToDelete.creater.allProperties.pull(propertyToDelete);
        await propertyToDelete.creater.save({ session });
        await session.commitTransaction();
        res.status(200).json({ message: 'Property Deleted Successfully' })
        
    } catch (error) {
        res.status(500).json({message:error.message})
    }
   
};
export {
    getAllProperties,
    createProperty,
    getPropertyDetail,
    updateProperty,
    deleteProperty,
}