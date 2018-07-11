import { PubSub, withFilter } from "graphql-subscriptions";
import requiresAuth from "../permissions";

const pubsub = new PubSub();
const NEW_CHANNEL_MESSAGE = "NEW_CHANNEL_MESSAGE";

export default {
  Subscription: {
    newChannelMessage: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(NEW_CHANNEL_MESSAGE),
        (payload, args) => {
          return payload.channelId === args.channelId;
        }
      )
    }
  },
  Message: {
    user: ({ userId }, args, { models }, info) =>
      (models || info.rootValue.context.models).User.findOne({ where: { id: userId } })
  },

  Query: {
    messages: requiresAuth.createResolver(async (parent, { channelId }, { models, user }) => {
      return models.Message.findAll(
        { order: [["created_at", "ASC"]], where: { channelId } },
        { raw: true }
      );
    })
  },
  Mutation: {
    createMessage: async (parent, args, { models, user }) => {
      try {
        const message = await models.Message.create({ ...args, userId: user.id });
        pubsub.publish(
          NEW_CHANNEL_MESSAGE,
          {
            channelId: args.channelId,
            newChannelMessage: message.dataValues,
            context: { models }
          },
        );

        return true;
      } catch (err) {
        console.log("Error in message.js resolver", err);
        return false;
      }
    }
  }
};
