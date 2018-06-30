import requiresAuth from "../permissions";

export default {
  Message: {
    user: ({ userId }, args, { models }) => models.User.findOne({ where: { id: userId } })
  },
  Query: {
    messages: requiresAuth.createResolver(async (parent, { channelId }, { models, user }) => {
      return models.Message.findAll({ order: [['created_at', 'ASC']], where: { channelId } }, { raw: true });
    })
  },
  Mutation: {
    createMessage: async (parent, args, { models, user }) => {
      try {
        await models.Message.create({ ...args, userId: user.id });
        return true;
      } catch (err) {
        console.log("Error in message.js resolver", err);
        return false;
      }
    }
  }
};
