import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const {content} = req.body

    if(!content){
        throw new ApiError(400 , "Content is required")
    }

    const tweet = await Tweet.create({
        content : content,
        owner : req.user._id
    })
    
    if(!tweet){
        throw new ApiError(500 , "Failed to create tweet")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            tweet,
            "Tweet created successfully"
        )
    )
 })

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const {userId} = req.params

    if(!userId){
        throw new ApiError(400 , "User Id required")
    }

    const tweets = await Tweet.find({owner : userId})

    if(!tweets){
        throw new ApiError(400 , "No tweets found")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            tweets,
            "Tweets fetched successfully"
        )
    )
})

const updateTweet = asyncHandler(async (req, res) => {
    
    const {tweetid} = req.params
    const {content} = req.body
    
    if (!tweetid || !content){
        throw new ApiError(400 , "All Fields required")
    }

    const tweet = await Tweet.findByIdAndUpdate(
        tweetid,
        {
            content : content,
            
        },
        {
            new : true
        }
    )

    
    if (!tweet){
        throw new ApiError(500 , "Failed to update tweet")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            tweet,
            "Tweet updated successfully"
        )
    )
    
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const {tweetId} = req.params

    if(!tweetId){
        throw new ApiError(400, "Tweet Id is required")

    }

    const tweet = await Tweet.findById(tweetId)

    if(!tweet){
        throw new ApiError(404 , "Tweet not found")
    }

    await Tweet.findByIdAndDelete(tweetId)

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            tweet,
            "Tweet deleted successfully"
        )
    )

    
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}
