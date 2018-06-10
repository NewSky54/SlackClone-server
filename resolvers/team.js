import formatErrors from "./../formatErrors";
import requiresAuth from "./../permissions";

export default {
  Query: {
    allTeams: requiresAuth.createResolver(async (parent, args, { models, user }) =>
      models.Team.findAll({ where: { owner: user.id } }, { raw: true })
    )
  },
  Mutation: {
    createTeam: requiresAuth.createResolver(async (parent, args, { models, user }) => {
      // parent (or obj): The Previous Object, which for a field on the root Query type is often not used.
      // args: The arguments provided to the field in the GraphQL query.
      // context: A value which is provided to every resolver and holds important contextual information like the currently logged in user, or access to a DB.
      try {
        const team = await models.Team.create({ ...args, owner: user.id });
        await models.Channel.create({ name: "general", public: true, teamId: team.id });
        return {
          ok: true,
          team
        };
      } catch (err) {
        return {
          ok: false,
          errors: formatErrors(err)
        };
      }
    })
  },
  Team: {
    channels: ({ id }, args, { models }) => models.Channel.findAll({ where: { teamId: id } })
  }
};
