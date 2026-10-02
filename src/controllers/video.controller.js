import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
    let filter = {}

    if (query){
        filter.title = {$regex:query , options : 1}
    }

    if (userId){
        filter.owner = userId
    }

    let sort = {}

    if(sortType === "asc"){
        sort[sortBy] = 1
    }
    else{
        sort[sortBy] = -1
    }

    const skip = (page - 1) * limit 
    
    const videos = await Video.find(filter).sort(sort).skip(skip).limit(limit)
    
    const getvideoscount = await Video.countDocuments(filter)
    
    
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {
                videos,
                getvideoscount
            },
            "Videos Fetched"
        )
    )

})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video
    
    if(!title || !description){
           throw new ApiError(400, "Title and description required")
    }
    if (!req.files?.videoFile || !req.files?.thumbnail){
        throw new ApiError(400, "All fields required")
    }

    const {videoFile , thumbnail} = req.files

    const localVideoPath = videoFile[0]?.path
    const localThumbnailPath = thumbnail[0]?.path

    if (!localVideoPath){
        throw new ApiError(400, "Video file not found")
    }

    if (!localThumbnailPath){
        throw new ApiError(400, "Thumbnail file not found")
    }

    const uploadvideo = await uploadOnCloudinary(localVideoPath)
    const uploadthumbnail = await uploadOnCloudinary(localThumbnailPath)

    if (!uploadvideo){
        throw new ApiError(400, "Error uploading video")
    }

    if (!uploadthumbnail){
        throw new ApiError(400, "Error uploading thumbnail")
    }

    const VideoFile = uploadvideo.secure_url
    const VideoDuration = uploadvideo.duration
    const Thumbnail = uploadthumbnail.secure_url

    const video = await Video.create(
        {
            title,
            description,
            videoFile: VideoFile,
            thumbnail: Thumbnail,
            duration: VideoDuration,
            owner: req.user._id
        }
    )

    if(!video){
        throw new ApiError(404 , "Video not uploaded")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            video,
            "Video Uploaded"
        )
    )
    
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
    if(!videoId){
        throw new ApiError(404 , "video ID required")
    
    }
    const video = await Video.findById(videoId)

    if(!video){
        throw new ApiError(404, "Video not found")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            video,
            "Video Fetched"
        )
    )

})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { title, description } = req.body
    const thumbnailLocalPath = req.file?.path

    if (!thumbnailLocalPath) {
        throw new ApiError(400, "Thumbnail file required")
    }

    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)

    if (!thumbnail) {
        throw new ApiError(400, "Error uploading thumbnail")
    }

    const video = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                title,
                description,
                thumbnail: thumbnail.secure_url
            }
        },
        { new: true }
    )

    if (!video) {
        throw new ApiError(500, "Failed to update video")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                video,
                "Video updated successfully"
            )
        )
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
    if(!videoId){
        throw new ApiError(400 , "Video Id required")    
    }
    
    const video = await Video.findById(videoId)
    
    if(!video){
        throw new ApiError(404 , "Video not found")
    }

    await Video.findByIdAndDelete(videoId)
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            video,
            "Video deleted successfully"
        )
    )

})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if(!videoId){
        throw new ApiError(400 , "videoId is requried")
    }

    const video = await Video.findById(videoId)

    if(!video){
        throw new ApiError(404 , "Video not found")
    }

    video.isPublished = !video.isPublished
    
    await video.save({validatebeforesave : true})

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            video,
            "Video published status toggled successfully"
        )
    )
    
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
