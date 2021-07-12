const { User } = require('../models')
const { AuthenticationError } = require('apollo-server-express')

const resolvers ={
    Query: {
        me: async(parent, args, context) => {
            if(context.user){
            const userData = await User.findOne({ _id: context.user._id})
            .select('-__v -password')
            .populate('saveBooks')

            return userData
            }
            throw new AuthenticationError('Not Logged In')
        },
    },
    Mutation: {
        login: async(parent, { email, password }) => {
            const user = await User.findOne({ email })
            if(!user){
                throw new AuthenticationError('Incorrect Credentials')
            }
            const correctPw = await user.isCorrectPassword(password)

            if(!correctPw){
                throw new AuthenticationError('Incorrent Credentials')
            }
            const token = signToken(user)
            return { token, user }
        },
        addUser: async(parent, args) => {
            const user= await User.create(args)
            const token = signToken(user)

            return { token, user }
        },
        saveBook: async(parent, { bookData }, context) => {
            if(context.user){
                const newBookData = await User.findByIdAndUpdate(
                    {_id: context.user._id},
                    { $push: { savedBooks: bookData } },
                    { new: true, runValidators: true }
                )

                return newBookData
            }

            throw new AuthenticationError('You need to be logged in to save a book!')
        },
        removeBook: async(parent, { bookId }, context)=>{
            if(context.user){
                const deleteBookData = await User.findByIdAndUpdate(
                    { _id: context.user._id },
                    { $pull: { savedBooks: { bookId } } },
                    { new: true }
                )

                return deleteBookData
             }

             throw new AuthenticationError('You need to be logged in to remove a book!')
         }
    }
}

module.exports = resolvers