import { AuthenticationError } from 'apollo-server-express';
import { User } from '../models';
import { signToken } from '../utils/auth';
import { IResolvers } from '@graphql-tools/utils';
import { Context } from '../types/context'; // You’ll define this

const resolvers: IResolvers<any, Context> = {
  Query: {
    me: async (_parent, _args, context) => {
      if (context.user) {
        return await User.findById(context.user._id);
      }
      throw new AuthenticationError('Not logged in');
    }
  },

  Mutation: {
    addUser: async (_parent, args) => {
      const user = await User.create(args);
      const token = signToken(user);
      return { token, user };
    },
    login: async (_parent, { email, password }) => {
      const user = await User.findOne({ email });
      if (!user || !(await user.isCorrectPassword(password))) {
        throw new AuthenticationError('Invalid credentials');
      }
      const token = signToken(user);
      return { token, user };
    },
    saveBook: async (_parent, { bookData }, context) => {
      if (!context.user) throw new AuthenticationError('Not logged in');
      return await User.findByIdAndUpdate(
        context.user._id,
        { $addToSet: { savedBooks: bookData } },
        { new: true, runValidators: true }
      );
    },
    removeBook: async (_parent, { bookId }, context) => {
      if (!context.user) throw new AuthenticationError('Not logged in');
      return await User.findByIdAndUpdate(
        context.user._id,
        { $pull: { savedBooks: { bookId } } },
        { new: true }
      );
    }
  }
};

export default resolvers;
