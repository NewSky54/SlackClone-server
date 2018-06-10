import formatErrors from "./../formatErrors";

export default {
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
