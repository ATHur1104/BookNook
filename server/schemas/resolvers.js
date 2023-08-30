const { AuthenticationError } = require('apollo-server-express');
const { User } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
  Query: {
    me: async (parent, args, context) => {
      if (context.user) {
        return userData.findOne({ _id: context.user._id });
      }
      throw new AuthenticationError('You need to be logged in!');
    },
  },
  Mutation: {
      createUser: async (parent, { username, email, password }) => {
        const user = await User.create({ username, email, password });
        const token = signToken(user);
        return { token, user };
      },
      login: async (parent, { email, password }) => {
        const user = await User.findOne({ email });
        if (!user) {
          throw new AuthenticationError("Can't find this user");
        }
        const correctPw = await user.isCorrectPassword(password);
        if (!correctPw) {
          throw new AuthenticationError('Wrong password!');
        }
        const token = signToken(user);
        return { token, user };
      },
      saveBook: async (parent, { input }, { user }) => {
        if (!user) {
          throw new AuthenticationError('You need to be logged in!');
        }
        const updatedUser = await User.findByIdAndUpdate(
          user._id,
          { $addToSet: { savedBooks: input } },
          { new: true }
        );
        return updatedUser;
      },
      deleteBook: async (parent, { bookId }, { user }) => {
        if (!user) {
          throw new AuthenticationError('You need to be logged in!');
        }
        const updatedUser = await User.findByIdAndUpdate(
          user._id,
          { $pull: { savedBooks: { bookId } } },
          { new: true }
        );
        return updatedUser;
      },
    },

  }

module.exports = resolvers;
